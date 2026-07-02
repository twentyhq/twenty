import { type UIMessageChunk } from 'ai';

type StreamChunkSequencer = {
  push: (chunk: UIMessageChunk, seq: number | undefined) => void;
  // Applies everything buffered in ascending seq order, skipping the gap.
  // Degraded escape hatch for a gap no replay can fill (expired chunk list):
  // the mid-stream adapter downstream synthesizes the missing part starts.
  flushPending: () => void;
  reset: () => void;
};

const GAP_STALL_TIMEOUT_IN_MS = 2_000;

// Chunks reach the client on two unsynchronized paths (live SSE events and
// catchup replay), so arrival order is not sequence order. The sequencer
// applies chunks strictly by their server-assigned seq: early arrivals wait
// in a buffer, duplicates from catchup overlap are dropped, and a gap that
// nothing fills triggers onGapStalled (a refetch replays the missing range).
export const createStreamChunkSequencer = ({
  onApply,
  onGapStalled,
  gapStallTimeoutInMs = GAP_STALL_TIMEOUT_IN_MS,
}: {
  onApply: (chunk: UIMessageChunk) => void;
  onGapStalled: () => void;
  gapStallTimeoutInMs?: number;
}): StreamChunkSequencer => {
  let lastAppliedSeq = 0;
  const pendingBySeq = new Map<number, UIMessageChunk>();
  let gapTimer: ReturnType<typeof setTimeout> | null = null;

  const clearGapTimer = () => {
    if (gapTimer !== null) {
      clearTimeout(gapTimer);
      gapTimer = null;
    }
  };

  const drainPending = () => {
    let nextChunk = pendingBySeq.get(lastAppliedSeq + 1);

    while (nextChunk !== undefined) {
      pendingBySeq.delete(lastAppliedSeq + 1);
      lastAppliedSeq += 1;
      onApply(nextChunk);
      nextChunk = pendingBySeq.get(lastAppliedSeq + 1);
    }

    if (pendingBySeq.size === 0) {
      clearGapTimer();
    }
  };

  return {
    push: (chunk, seq) => {
      // Chunks without a seq (defensive: unknown server version) apply
      // immediately without participating in ordering.
      if (seq === undefined) {
        onApply(chunk);

        return;
      }

      if (seq <= lastAppliedSeq) {
        return;
      }

      if (seq === lastAppliedSeq + 1) {
        lastAppliedSeq = seq;
        onApply(chunk);
        drainPending();

        return;
      }

      pendingBySeq.set(seq, chunk);

      if (gapTimer === null) {
        gapTimer = setTimeout(() => {
          gapTimer = null;

          if (pendingBySeq.size > 0) {
            onGapStalled();
          }
        }, gapStallTimeoutInMs);
      }
    },
    flushPending: () => {
      const orderedSeqs = [...pendingBySeq.keys()].sort((a, b) => a - b);

      for (const seq of orderedSeqs) {
        const pendingChunk = pendingBySeq.get(seq);

        pendingBySeq.delete(seq);
        lastAppliedSeq = seq;

        if (pendingChunk !== undefined) {
          onApply(pendingChunk);
        }
      }

      clearGapTimer();
    },
    reset: () => {
      lastAppliedSeq = 0;
      pendingBySeq.clear();
      clearGapTimer();
    },
  };
};

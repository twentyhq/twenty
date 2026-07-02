import { type UIMessageChunk } from 'ai';

type StreamChunkSequencer = {
  push: (chunk: UIMessageChunk, seq: number | undefined) => void;
  reset: () => void;
};

const GAP_STALL_TIMEOUT_IN_MS = 2_000;

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
  let gapStallCount = 0;
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
      gapStallCount = 0;
    }
  };

  const flushPending = () => {
    const orderedSeqs = [...pendingBySeq.keys()].sort(
      (seqA, seqB) => seqA - seqB,
    );

    for (const seq of orderedSeqs) {
      const pendingChunk = pendingBySeq.get(seq);

      pendingBySeq.delete(seq);
      lastAppliedSeq = seq;

      if (pendingChunk !== undefined) {
        onApply(pendingChunk);
      }
    }

    clearGapTimer();
    gapStallCount = 0;
  };

  const handleGapStall = () => {
    gapTimer = null;

    if (pendingBySeq.size === 0) {
      return;
    }

    gapStallCount += 1;

    if (gapStallCount === 1) {
      onGapStalled();
      armGapTimer();

      return;
    }

    flushPending();
  };

  const armGapTimer = () => {
    if (gapTimer === null) {
      gapTimer = setTimeout(handleGapStall, gapStallTimeoutInMs);
    }
  };

  return {
    push: (chunk, seq) => {
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
      armGapTimer();
    },
    reset: () => {
      lastAppliedSeq = 0;
      gapStallCount = 0;
      pendingBySeq.clear();
      clearGapTimer();
    },
  };
};

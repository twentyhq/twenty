import { useCallback, useEffect, useMemo, useState } from 'react';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import { loadReviewLines, updateReviewLine } from '@/propel/lib/oneOnOneCrm';
import {
  type CompleteMeetingResponse,
  type GenerateBatchCursor,
  type GenerateBatchResponse,
  type ReviewLine,
  type ReviewStatus,
} from '@/propel/types/oneOnOne';

// Drives the Meeting Runner for ONE meeting: generate the per-lead review lines
// (batched → determinate progress), load them, walk undiscussed-first, autosave
// scalar edits, then wrap up (assessment + Complete → nextActions become Tasks).
// Ported from the in-sandbox one-on-one-runner-panel.tsx; same routes, same
// GraphQL ops — nothing on the backend changes.

export type RunnerPhase = 'generating' | 'ready' | 'wrapup' | 'error';

export type RunnerGroups = {
  attn: ReviewLine[];
  undisc: ReviewLine[];
  done: ReviewLine[];
};

export type OneOnOneRunnerState = {
  phase: RunnerPhase;
  lines: ReviewLine[];
  groups: RunnerGroups;
  current: ReviewLine | null;
  currentId: string | null;
  discussedCount: number;
  remainingCount: number;
  genProcessed: number;
  genTotal: number;
  savingId: string | null;
  completing: boolean;
  completed: boolean;
  select: (id: string) => void;
  saveLine: (id: string, patch: Partial<ReviewLine>) => void;
  nextLead: () => void;
  complete: (assessment: string) => Promise<CompleteMeetingResponse | null>;
  retry: () => void;
};

export const useOneOnOneRunner = (
  meetingId: string | null,
): OneOnOneRunnerState => {
  const [phase, setPhase] = useState<RunnerPhase>('generating');
  const [lines, setLines] = useState<ReviewLine[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [genProcessed, setGenProcessed] = useState(0);
  const [genTotal, setGenTotal] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (meetingId === null || meetingId === '') {
      setPhase('error');
      return;
    }
    let cancelled = false;
    setPhase('generating');
    setGenProcessed(0);
    setGenTotal(0);
    setCompleted(false);

    void (async () => {
      try {
        // Batched generate → true X / N progress bar.
        let cursor: GenerateBatchCursor | null = null;
        let total = 0;
        let processed = 0;
        let guard = 0;
        do {
          const r: GenerateBatchResponse | null =
            await callPropelRoute<GenerateBatchResponse>(
              '/one-on-one/generate-review-lines',
              { meetingId, batch: true, cursor, total },
            );
          if (cancelled) return;
          if (r === null) {
            setPhase('error');
            return;
          }
          total = r.total ?? total;
          processed += r.processedThisBatch ?? 0;
          setGenTotal(total);
          setGenProcessed(total > 0 ? Math.min(processed, total) : processed);
          cursor = r.nextCursor ?? null;
          if (r.done === true || cursor === null) break;
        } while (++guard < 200);

        const loaded = await loadReviewLines(meetingId);
        if (cancelled) return;
        setLines(loaded);
        if (loaded.length === 0) {
          setPhase('wrapup');
          return;
        }
        const firstUndiscussed =
          loaded.find((l) => l.discussed !== true) ?? loaded[0];
        setCurrentId(firstUndiscussed.id);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meetingId, nonce]);

  const saveLine = useCallback((id: string, patch: Partial<ReviewLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setSavingId(id);
    void (async () => {
      try {
        await updateReviewLine(id, {
          ...('notes' in patch ? { notes: patch.notes } : {}),
          ...('nextAction' in patch ? { nextAction: patch.nextAction } : {}),
          ...('discussed' in patch ? { discussed: patch.discussed } : {}),
          ...('lineStatus' in patch ? { lineStatus: patch.lineStatus } : {}),
        });
      } finally {
        setSavingId((s) => (s === id ? null : s));
      }
    })();
  }, []);

  const groups: RunnerGroups = useMemo(() => {
    const attn: ReviewLine[] = [];
    const undisc: ReviewLine[] = [];
    const done: ReviewLine[] = [];
    for (const l of lines) {
      if (l.discussed === true) done.push(l);
      else if (l.lineStatus === 'FLAGGED' || l.lineStatus === 'STALLED')
        attn.push(l);
      else undisc.push(l);
    }
    return { attn, undisc, done };
  }, [lines]);

  const current = useMemo(
    () => lines.find((l) => l.id === currentId) ?? null,
    [lines, currentId],
  );
  const discussedCount = groups.done.length;
  const remainingCount = groups.undisc.length + groups.attn.length;

  const select = useCallback((id: string) => setCurrentId(id), []);

  const nextLead = useCallback(() => {
    if (current === null) return;
    saveLine(current.id, {
      discussed: true,
      lineStatus: 'DISCUSSED' as ReviewStatus,
    });
    const remaining = lines.filter(
      (l) => l.id !== current.id && l.discussed !== true,
    );
    if (remaining.length === 0) {
      setPhase('wrapup');
      setCurrentId(null);
      return;
    }
    setCurrentId(remaining[0].id);
  }, [current, lines, saveLine]);

  const complete = useCallback(
    async (assessment: string): Promise<CompleteMeetingResponse | null> => {
      if (meetingId === null || meetingId === '') return null;
      setCompleting(true);
      try {
        const res = await callPropelRoute<CompleteMeetingResponse>(
          '/one-on-one/complete-meeting',
          { meetingId, assessment },
        );
        if (res !== null && res.error === undefined) setCompleted(true);
        return res;
      } finally {
        setCompleting(false);
      }
    },
    [meetingId],
  );

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  return {
    phase,
    lines,
    groups,
    current,
    currentId,
    discussedCount,
    remainingCount,
    genProcessed,
    genTotal,
    savingId,
    completing,
    completed,
    select,
    saveLine,
    nextLead,
    complete,
    retry,
  };
};

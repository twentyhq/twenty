import { useCallback, useRef, useState } from 'react';

import { UNDO_STACK_MAX } from '@/data-validator/constants/JustusTruthDomains.constants';
import {
  type JustusTruthRecord,
  type ReviewAction,
  type SessionStats,
  type UndoEntry,
} from '@/data-validator/types/data-validator.types';

const INITIAL_STATS: SessionStats = {
  approved: 0,
  rejected: 0,
  supported: 0,
  skipped: 0,
  startedAt: Date.now(),
  reviewTimes: [],
};

export const useReviewSession = () => {
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [stats, setStats] = useState<SessionStats>(INITIAL_STATS);
  const [streak, setStreak] = useState(0);
  const lastReviewStart = useRef<number>(Date.now());

  const recordAction = useCallback(
    (
      action: ReviewAction,
      truth: JustusTruthRecord,
      previousState: {
        status: string | null;
        approvedBy: string | null;
        approvedAt: string | null;
      },
    ) => {
      const elapsed = Date.now() - lastReviewStart.current;
      lastReviewStart.current = Date.now();

      // Push to undo stack
      const entry: UndoEntry = {
        truthId: truth.id,
        action,
        previousStatus: previousState.status,
        previousApprovedBy: previousState.approvedBy,
        previousApprovedAt: previousState.approvedAt,
        truthText: truth.truthText,
        record: { ...truth },
      };

      setUndoStack((prev) => {
        const next = [entry, ...prev];
        return next.length > UNDO_STACK_MAX
          ? next.slice(0, UNDO_STACK_MAX)
          : next;
      });

      // Update stats
      const statKeyMap: Record<ReviewAction, keyof SessionStats> = {
        approve: 'approved',
        reject: 'rejected',
        support: 'supported',
        skip: 'skipped',
      };
      const statKey = statKeyMap[action];

      setStats((prev) => ({
        ...prev,
        [statKey]: (prev[statKey] as number) + 1,
        reviewTimes: [...prev.reviewTimes, elapsed],
      }));

      // Update streak
      if (action === 'skip') {
        setStreak(0);
      } else {
        setStreak((prev) => prev + 1);
      }
    },
    [],
  );

  const undo = useCallback((): UndoEntry | null => {
    if (undoStack.length === 0) return null;

    const [entry, ...rest] = undoStack;
    setUndoStack(rest);

    // Revert stats
    const statKeyMap: Record<ReviewAction, keyof SessionStats> = {
      approve: 'approved',
      reject: 'rejected',
      support: 'supported',
      skip: 'skipped',
    };
    const key = statKeyMap[entry.action];
    setStats((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] as number) - 1),
    }));

    // Reset streak on undo
    setStreak(0);

    return entry;
  }, [undoStack]);

  const averageReviewTime =
    stats.reviewTimes.length > 0
      ? Math.round(
          stats.reviewTimes.reduce((a, b) => a + b, 0) /
            stats.reviewTimes.length /
            1000,
        )
      : 0;

  const totalReviewed =
    stats.approved + stats.rejected + stats.supported + stats.skipped;

  return {
    recordAction,
    undo,
    canUndo: undoStack.length > 0,
    lastUndoEntry: undoStack[0] ?? null,
    stats,
    streak,
    averageReviewTime,
    totalReviewed,
  };
};

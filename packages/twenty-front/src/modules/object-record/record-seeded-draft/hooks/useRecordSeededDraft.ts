import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const PERSIST_DEBOUNCE_MS = 500;

type UseRecordSeededDraftArgs<TDraft extends object> = {
  // Derived from the record on every render; the single source of remote truth.
  upstreamDraft: TDraft;
  onPersist: (draft: TDraft) => void;
  persistDebounceMs?: number;
  // Identity of the record being edited. When it changes, the draft is
  // reseeded from upstream and any pending persist is dropped so it cannot
  // write the previous record's content onto the new one. Consumers that
  // remount on record change (key={recordId}) do not need it.
  resetKey?: string;
};

type ScheduledPersist<TDraft> = {
  draftToPersist: TDraft;
  scheduledResetGeneration: number;
};

// Editing state seeded from a record, kept live against remote changes.
//
// Record data flows into local editing state exactly once per seed, so
// changes persisted by someone else (the AI chat, another user, another tab)
// arrive through the record without ever reaching the draft. This hook owns
// the policy for that seam, the same way on every surface:
// - a pristine draft adopts the remote value as soon as it arrives;
// - a dirty draft wins, and overwrites the remote value when its debounced
//   persist flushes (last write wins);
// - our own persists come back as an upstream value equal to the draft and
//   only mark the draft pristine again, never disrupting typing.
//
// Controlled inputs re-render from `draft`. Uncontrolled inputs remount via
// `draftResyncKey`. Imperative editors (BlockNote) watch `draftResyncKey` and
// replace their content when it changes; those that debounce their own
// serialization call `markDirty` on the raw change so the gap before the
// serialized value reaches `updateDraft` is never mistaken for pristine.
export const useRecordSeededDraft = <TDraft extends object>({
  upstreamDraft,
  onPersist,
  persistDebounceMs = PERSIST_DEBOUNCE_MS,
  resetKey,
}: UseRecordSeededDraftArgs<TDraft>) => {
  const [draft, setDraft] = useState<TDraft>(upstreamDraft);
  const [lastUpstreamDraft, setLastUpstreamDraft] =
    useState<TDraft>(upstreamDraft);
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  const [resyncCount, setResyncCount] = useState(0);
  const [resetGeneration, setResetGeneration] = useState(0);
  const [hasUncommittedEdit, setHasUncommittedEdit] = useState(false);

  // The reset check below runs during render, where cancelling the timer
  // would be an unsafe side effect; instead each scheduled persist remembers
  // the reset generation it was scheduled under and is dropped once that
  // generation is over. A counter rather than the key itself, so returning to
  // a previously edited record (A to B back to A) still drops A's first
  // pending persist instead of letting it land on the reseeded draft.
  const persistDebounced = useDebouncedCallback(
    ({
      draftToPersist,
      scheduledResetGeneration,
    }: ScheduledPersist<TDraft>) => {
      if (scheduledResetGeneration !== resetGeneration) {
        return;
      }

      onPersist(draftToPersist);
    },
    persistDebounceMs,
  );

  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setLastUpstreamDraft(upstreamDraft);
    setDraft(upstreamDraft);
    setResyncCount((count) => count + 1);
    setResetGeneration((generation) => generation + 1);
    setHasUncommittedEdit(false);
  } else if (!isDeeplyEqual(upstreamDraft, lastUpstreamDraft)) {
    const isDraftPristine =
      !hasUncommittedEdit &&
      !persistDebounced.isPending() &&
      isDeeplyEqual(draft, lastUpstreamDraft);

    setLastUpstreamDraft(upstreamDraft);

    if (isDraftPristine) {
      setDraft(upstreamDraft);
      setResyncCount((count) => count + 1);
    }
  }

  // Trailing keystrokes must never be lost when the editor goes away.
  useEffect(() => () => persistDebounced.flush(), [persistDebounced]);

  const updateDraft = (partialDraft: Partial<TDraft>) => {
    const nextDraft = { ...draft, ...partialDraft };

    setDraft(nextDraft);
    setHasUncommittedEdit(false);
    persistDebounced({
      draftToPersist: nextDraft,
      scheduledResetGeneration: resetGeneration,
    });
  };

  // Holds off adoption for editors whose serialized value only arrives later,
  // without scheduling a persist of a value we do not have yet.
  const markDirty = () => {
    setHasUncommittedEdit(true);
  };

  return {
    draft,
    updateDraft,
    markDirty,
    flush: persistDebounced.flush,
    isDirty:
      hasUncommittedEdit ||
      persistDebounced.isPending() ||
      !isDeeplyEqual(draft, lastUpstreamDraft),
    draftResyncKey: resyncCount,
  };
};

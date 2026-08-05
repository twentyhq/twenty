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
  scheduledResetKey: string | undefined;
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
// `draftResyncKey`. Imperative editors (BlockNote) watch `draftResyncKey`
// and replace their content when it changes, and must call `updateDraft`
// synchronously on change so no window is mistaken for pristine.
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

  // The reset check below runs during render, where cancelling the timer
  // would be an unsafe side effect; instead each scheduled persist remembers
  // the resetKey it was scheduled under and is dropped if a reset happened
  // in between, so it can never target the previous record.
  const persistDebounced = useDebouncedCallback(
    ({ draftToPersist, scheduledResetKey }: ScheduledPersist<TDraft>) => {
      if (scheduledResetKey !== resetKey) {
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
  } else if (!isDeeplyEqual(upstreamDraft, lastUpstreamDraft)) {
    const isDraftPristine =
      !persistDebounced.isPending() && isDeeplyEqual(draft, lastUpstreamDraft);

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
    persistDebounced({
      draftToPersist: nextDraft,
      scheduledResetKey: resetKey,
    });
  };

  return {
    draft,
    updateDraft,
    flush: persistDebounced.flush,
    isDirty:
      persistDebounced.isPending() || !isDeeplyEqual(draft, lastUpstreamDraft),
    draftResyncKey: resyncCount,
  };
};

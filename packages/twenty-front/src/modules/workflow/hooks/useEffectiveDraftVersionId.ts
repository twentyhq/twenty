import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { lastDiscardedDraftIdState } from '@/workflow/states/lastDiscardedDraftIdState';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useEffectiveDraftVersionId = (
  draftVersionFromServer: { id: string } | undefined,
): {
  effectiveDraftId: string | undefined;
  lastDiscardedDraftId: string | undefined;
} => {
  const getVersionFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    recordGqlFields: { id: true, status: true, deletedAt: true },
  });

  const [lastDiscardedDraftId, setLastDiscardedDraftId] = useAtom(
    lastDiscardedDraftIdState,
  );

  const [previouslyKnownDraftId, setPreviouslyKnownDraftId] = useState<
    string | undefined
  >();

  if (isDefined(draftVersionFromServer)) {
    const isReaddedBySSEAfterDiscard =
      draftVersionFromServer.id === lastDiscardedDraftId;

    if (isReaddedBySSEAfterDiscard) {
      return { effectiveDraftId: undefined, lastDiscardedDraftId };
    }

    const isNewDraft = draftVersionFromServer.id !== previouslyKnownDraftId;

    if (isNewDraft) {
      setPreviouslyKnownDraftId(draftVersionFromServer.id);
    }

    if (isDefined(lastDiscardedDraftId)) {
      setLastDiscardedDraftId(undefined);
    }

    return {
      effectiveDraftId: draftVersionFromServer.id,
      lastDiscardedDraftId,
    };
  }

  if (!isDefined(previouslyKnownDraftId)) {
    return { effectiveDraftId: undefined, lastDiscardedDraftId };
  }

  const cachedDraft = getVersionFromCache(previouslyKnownDraftId);

  const isDraftStillAlive =
    isDefined(cachedDraft) &&
    cachedDraft.status === 'DRAFT' &&
    !isDefined(cachedDraft.deletedAt);

  if (isDraftStillAlive) {
    return { effectiveDraftId: previouslyKnownDraftId, lastDiscardedDraftId };
  }

  const wasDiscarded =
    isDefined(cachedDraft) && isDefined(cachedDraft.deletedAt);

  if (wasDiscarded) {
    setLastDiscardedDraftId(previouslyKnownDraftId);
  }

  setPreviouslyKnownDraftId(undefined);

  return { effectiveDraftId: undefined, lastDiscardedDraftId };
};

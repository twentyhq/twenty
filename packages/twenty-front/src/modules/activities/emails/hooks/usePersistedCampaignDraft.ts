import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const PERSIST_DEBOUNCE_MS = 500;

type UsePersistedCampaignDraftArgs<TDraft extends object> = {
  campaignId: string;
  initialDraft: () => TDraft;
  toUpdateOneRecordInput: (
    draft: TDraft,
  ) => Partial<Omit<MessageCampaign, 'id'>>;
};

export const usePersistedCampaignDraft = <TDraft extends object>({
  campaignId,
  initialDraft,
  toUpdateOneRecordInput,
}: UsePersistedCampaignDraftArgs<TDraft>) => {
  const [draft, setDraft] = useState<TDraft>(initialDraft);
  const [recordDraft, setRecordDraft] = useState<TDraft>(draft);
  const [remoteResyncCount, setRemoteResyncCount] = useState(0);

  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueErrorSnackBar } = useSnackBar();

  const persistDebounced = useDebouncedCallback((nextDraft: TDraft) => {
    updateOneRecord<MessageCampaign>({
      objectNameSingular: CoreObjectNameSingular.MessageCampaign,
      idToUpdate: campaignId,
      updateOneRecordInput: toUpdateOneRecordInput(nextDraft),
    }).catch(() =>
      enqueueErrorSnackBar({ message: t`Failed to save the campaign` }),
    );
  }, PERSIST_DEBOUNCE_MS);

  // The draft is seeded from the record, so changes persisted by someone else
  // (the AI chat, another user, another tab) arrive through the record without
  // ever reaching the draft. Adopt them while the draft is pristine; a dirty
  // draft wins and overwrites the remote value when its debounced persist
  // flushes (last write wins). Our own persists land here too, as an upstream
  // value equal to the draft, and only mark the draft pristine again.
  const upstreamDraft = initialDraft();

  if (!isDeeplyEqual(upstreamDraft, recordDraft)) {
    const isDraftPristine =
      !persistDebounced.isPending() && isDeeplyEqual(draft, recordDraft);

    setRecordDraft(upstreamDraft);

    if (isDraftPristine) {
      setDraft(upstreamDraft);
      setRemoteResyncCount((count) => count + 1);
    }
  }

  const updateDraft = (partialDraft: Partial<TDraft>) => {
    const nextDraft = { ...draft, ...partialDraft };

    setDraft(nextDraft);
    persistDebounced(nextDraft);
  };

  return {
    draft,
    updateDraft,
    flush: persistDebounced.flush,
    // Inputs seeded through defaultValue (TipTap editors, record picker) read
    // the draft on mount only; key them with this to remount on adoption.
    draftResyncKey: `${campaignId}-${remoteResyncCount}`,
  };
};

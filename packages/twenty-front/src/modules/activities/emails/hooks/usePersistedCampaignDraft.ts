import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useDebouncedCallback } from 'use-debounce';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

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

  const updateDraft = (partialDraft: Partial<TDraft>) => {
    const nextDraft = { ...draft, ...partialDraft };

    setDraft(nextDraft);
    persistDebounced(nextDraft);
  };

  return { draft, updateDraft, flush: persistDebounced.flush };
};

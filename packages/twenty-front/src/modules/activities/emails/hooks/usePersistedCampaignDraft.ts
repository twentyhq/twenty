import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordSeededDraft } from '@/object-record/record-seeded-draft/hooks/useRecordSeededDraft';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

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
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueErrorSnackBar } = useSnackBar();

  const { draft, updateDraft, flush, draftResyncKey } = useRecordSeededDraft({
    upstreamDraft: initialDraft(),
    onPersist: (nextDraft) => {
      updateOneRecord<MessageCampaign>({
        objectNameSingular: CoreObjectNameSingular.MessageCampaign,
        idToUpdate: campaignId,
        updateOneRecordInput: toUpdateOneRecordInput(nextDraft),
      }).catch(() =>
        enqueueErrorSnackBar({ message: t`Failed to save the campaign` }),
      );
    },
  });

  return {
    draft,
    updateDraft,
    flush,
    // Inputs seeded through defaultValue (TipTap editors, record picker) read
    // the draft on mount only; key them with this to remount on adoption.
    draftResyncKey: `${campaignId}-${draftResyncKey}`,
  };
};

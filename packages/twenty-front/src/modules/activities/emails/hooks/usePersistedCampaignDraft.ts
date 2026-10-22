import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { PREVIEW_MESSAGE_CAMPAIGN_SEND } from '@/activities/emails/graphql/metadata-queries/previewMessageCampaignSend';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordSeededDraft } from '@/object-record/record-seeded-draft/hooks/useRecordSeededDraft';
import { useToast } from 'twenty-ui/components/feedback';

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
  const { enqueueToast } = useToast();
  const apolloClient = useApolloClient();

  const { draft, updateDraft, flush, draftResyncKey } = useRecordSeededDraft({
    upstreamDraft: initialDraft(),
    onPersist: (nextDraft) => {
      updateOneRecord<MessageCampaign>({
        objectNameSingular: CoreObjectNameSingular.MessageCampaign,
        idToUpdate: campaignId,
        updateOneRecordInput: toUpdateOneRecordInput(nextDraft),
      }).then(
        () =>
          apolloClient
            .refetchQueries({
              include: [PREVIEW_MESSAGE_CAMPAIGN_SEND],
            })
            .catch(() => undefined),
        () =>
          enqueueToast({
            status: 'error',
            children: t`Failed to save the campaign`,
          }),
      );
    },
  });

  return {
    draft,
    updateDraft,
    flush,
    // defaultValue-seeded inputs (TipTap, record picker) read the draft on mount only; key them to remount.
    draftResyncKey: `${campaignId}-${draftResyncKey}`,
  };
};

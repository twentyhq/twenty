import { usePersistedCampaignDraft } from '@/activities/emails/hooks/usePersistedCampaignDraft';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';

type CampaignDetailsDraft = {
  listId: string | null;
  unsubscribeTopicId: string | null;
  fromAddress: string;
  subject: string;
};

export const useCampaignDetailsState = ({
  campaign,
}: {
  campaign: MessageCampaign;
}) => {
  const { draft, updateDraft, flush } =
    usePersistedCampaignDraft<CampaignDetailsDraft>({
      campaignId: campaign.id,
      initialDraft: () => ({
        listId: campaign.listId,
        unsubscribeTopicId: campaign.unsubscribeTopicId,
        fromAddress: campaign.fromAddress?.primaryEmail ?? '',
        subject: campaign.subject ?? '',
      }),
      toUpdateOneRecordInput: (nextDraft) => ({
        listId: nextDraft.listId,
        unsubscribeTopicId: nextDraft.unsubscribeTopicId,
        fromAddress: {
          primaryEmail: nextDraft.fromAddress.trim(),
          additionalEmails: null,
        },
        subject: nextDraft.subject,
      }),
    });

  return {
    ...draft,
    flush,
    setListId: (listId: string | null) => updateDraft({ listId }),
    setUnsubscribeTopicId: (unsubscribeTopicId: string | null) =>
      updateDraft({ unsubscribeTopicId }),
    setFromAddress: (fromAddress: string) => updateDraft({ fromAddress }),
    setSubject: (subject: string) => updateDraft({ subject }),
  };
};

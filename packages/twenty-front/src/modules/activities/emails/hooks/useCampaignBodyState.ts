import { usePersistedCampaignDraft } from '@/activities/emails/hooks/usePersistedCampaignDraft';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';

export const useCampaignBodyState = ({
  campaign,
}: {
  campaign: MessageCampaign;
}) => {
  const { draft, updateDraft, flush, draftResyncKey } =
    usePersistedCampaignDraft({
      campaignId: campaign.id,
      initialDraft: () => ({ bodyTemplate: campaign.bodyTemplate ?? '' }),
      toUpdateOneRecordInput: ({ bodyTemplate }) => ({ bodyTemplate }),
    });

  return {
    body: draft.bodyTemplate,
    setBody: (bodyTemplate: string) => updateDraft({ bodyTemplate }),
    flush,
    draftResyncKey,
  };
};

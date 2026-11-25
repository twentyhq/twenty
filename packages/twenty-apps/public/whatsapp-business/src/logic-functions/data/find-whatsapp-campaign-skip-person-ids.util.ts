import { CoreApiClient } from 'twenty-client-sdk/core';
import { isNonEmptyString } from '@sniptt/guards';
import { SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS } from 'src/constants/send-template-to-people-max-recipients.constant';

export const findWhatsAppCampaignSkipPersonIds = async (campaignId: string): Promise<Set<string>> => {
  const { whatsAppCampaignSkips } = await new CoreApiClient().query({
    whatsAppCampaignSkips: {
      __args: { filter: { campaignId: { eq: campaignId } }, first: SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS },
      edges: { node: { personId: true } },
    },
  });

  return new Set(
    (whatsAppCampaignSkips?.edges ?? []).flatMap(({ node }: { node: { personId: string | null } }) =>
      isNonEmptyString(node.personId) ? [node.personId] : [],
    ),
  );
};

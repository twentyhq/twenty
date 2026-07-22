import { useQuery } from '@apollo/client/react';

import { CAMPAIGN_SEND_QUOTA } from '@/activities/emails/graphql/metadata-queries/campaignSendQuota';
import { type CampaignSendQuotaQuery } from '~/generated-metadata/graphql';

export const useCampaignSendQuota = () => {
  const { data } = useQuery<CampaignSendQuotaQuery>(CAMPAIGN_SEND_QUOTA, {
    fetchPolicy: 'cache-and-network',
  });

  return data?.campaignSendQuota ?? null;
};

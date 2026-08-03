import { useQuery } from '@apollo/client/react';

import {
  GET_MESSAGE_CAMPAIGN,
  GET_MESSAGE_CAMPAIGNS,
} from '@/activities/emails/graphql/metadata-queries/messageCampaigns';
import {
  type MessageCampaignDetails,
  type MessageCampaignSummary,
} from '@/activities/emails/types/MessageCampaign';

export const useMessageCampaigns = () => {
  const { data, loading, error, refetch } = useQuery<{
    messageCampaigns: MessageCampaignSummary[];
  }>(GET_MESSAGE_CAMPAIGNS, { fetchPolicy: 'cache-and-network' });

  return {
    campaigns: data?.messageCampaigns ?? [],
    loading,
    error,
    refetch,
  };
};

export const useMessageCampaign = (campaignId: string | undefined) => {
  const { data, loading, error, refetch } = useQuery<
    { messageCampaign: MessageCampaignDetails },
    { id: string }
  >(GET_MESSAGE_CAMPAIGN, {
    variables: { id: campaignId ?? '' },
    skip: campaignId === undefined,
    fetchPolicy: 'cache-and-network',
  });

  return { campaign: data?.messageCampaign, loading, error, refetch };
};

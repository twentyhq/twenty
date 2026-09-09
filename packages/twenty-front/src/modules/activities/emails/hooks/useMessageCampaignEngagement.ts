import { useQuery } from '@apollo/client/react';

import { isDefined } from 'twenty-shared/utils';

import { MESSAGE_CAMPAIGN_ENGAGEMENT } from '@/activities/emails/graphql/metadata-queries/messageCampaignEngagement';
import {
  type CampaignEngagementActivityFilter,
  type MessageCampaignEngagementQuery,
  type MessageCampaignEngagementQueryVariables,
} from '~/generated-metadata/graphql';

type UseMessageCampaignEngagementArgs = {
  messageCampaignId: string;
  activityFilter: CampaignEngagementActivityFilter;
  skip?: boolean;
};

export const useMessageCampaignEngagement = ({
  messageCampaignId,
  activityFilter,
  skip,
}: UseMessageCampaignEngagementArgs) => {
  const { data, error, loading } = useQuery<
    MessageCampaignEngagementQuery,
    MessageCampaignEngagementQueryVariables
  >(MESSAGE_CAMPAIGN_ENGAGEMENT, {
    skip,
    variables: { input: { messageCampaignId, activityFilter } },
    fetchPolicy: 'cache-and-network',
  });

  return {
    engagement: isDefined(error)
      ? null
      : (data?.messageCampaignEngagement ?? null),
    isLoading: loading && !isDefined(data),
    hasFailed: isDefined(error),
  };
};

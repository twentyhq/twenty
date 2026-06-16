import { useQuery } from '@apollo/client/react';

import { isNonEmptyString } from '@sniptt/guards';

import { PREVIEW_MESSAGE_CAMPAIGN_AUDIENCE } from '@/activities/emails/graphql/metadata-queries/previewMessageCampaignAudience';
import {
  type PreviewMessageCampaignAudienceQuery,
  type PreviewMessageCampaignAudienceQueryVariables,
} from '~/generated-metadata/graphql';

type UseCampaignAudiencePreviewArgs = {
  listId: string | null;
  unsubscribeTopicId: string | null;
};

export const useCampaignAudiencePreview = ({
  listId,
  unsubscribeTopicId,
}: UseCampaignAudiencePreviewArgs) => {
  const { data } = useQuery<
    PreviewMessageCampaignAudienceQuery,
    PreviewMessageCampaignAudienceQueryVariables
  >(PREVIEW_MESSAGE_CAMPAIGN_AUDIENCE, {
    skip: !isNonEmptyString(listId),
    variables: {
      input: {
        listId: listId ?? '',
        unsubscribeTopicId: unsubscribeTopicId ?? undefined,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  return data?.previewMessageCampaignAudience ?? null;
};

import { useQuery } from '@apollo/client/react';

import { isNonEmptyString } from '@sniptt/guards';

import { PREVIEW_MESSAGE_CAMPAIGN_AUDIENCE } from '@/activities/emails/graphql/queries/previewMessageCampaignAudience';
import {
  type PreviewMessageCampaignAudienceQuery,
  type PreviewMessageCampaignAudienceQueryVariables,
} from '~/generated-metadata/graphql';

type UseCampaignAudiencePreviewArgs = {
  listId: string | null;
  messageTopicId: string | null;
};

// Fetches the pre-send audience breakdown for the composer once a list is
// selected (re-runs when the topic changes). Returns null until a list is set.
export const useCampaignAudiencePreview = ({
  listId,
  messageTopicId,
}: UseCampaignAudiencePreviewArgs) => {
  const { data } = useQuery<
    PreviewMessageCampaignAudienceQuery,
    PreviewMessageCampaignAudienceQueryVariables
  >(PREVIEW_MESSAGE_CAMPAIGN_AUDIENCE, {
    skip: !isNonEmptyString(listId),
    variables: {
      input: {
        listId: listId ?? '',
        messageTopicId: messageTopicId ?? undefined,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  return data?.previewMessageCampaignAudience ?? null;
};

import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from 'twenty-shared/utils';

import { PREVIEW_MESSAGE_CAMPAIGN_SEND } from '@/activities/emails/graphql/metadata-queries/previewMessageCampaignSend';
import {
  type PreviewMessageCampaignSendQuery,
  type PreviewMessageCampaignSendQueryVariables,
} from '~/generated-metadata/graphql';

type UseCampaignSendPreviewArgs = {
  campaignId: string;
  scheduledAt: string | null;
};

export const useCampaignSendPreview = ({
  campaignId,
  scheduledAt,
}: UseCampaignSendPreviewArgs) => {
  const { data, error } = useQuery<
    PreviewMessageCampaignSendQuery,
    PreviewMessageCampaignSendQueryVariables
  >(PREVIEW_MESSAGE_CAMPAIGN_SEND, {
    variables: {
      input: {
        campaignId,
        scheduledAt: scheduledAt ?? undefined,
      },
    },
    fetchPolicy: 'cache-and-network',
    skip: !isNonEmptyString(campaignId),
  });

  return {
    sendPreview: isDefined(error)
      ? null
      : (data?.previewMessageCampaignSend ?? null),
    hasFailed: isDefined(error),
  };
};

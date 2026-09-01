import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export const updateSlackUserLink = async (
  client: CoreApiClient,
  {
    id,
    workspaceMemberId,
    name,
    source,
    consentState,
  }: {
    id: string;
    workspaceMemberId?: string;
    name?: string;
    source?: SlackUserLinkSource;
    consentState?: SlackUserLinkConsentState;
  },
): Promise<void> => {
  await client.mutation({
    updateSlackUserLink: {
      __args: {
        id,
        data: {
          ...(isNonEmptyString(workspaceMemberId) ? { workspaceMemberId } : {}),
          ...(isNonEmptyString(name) ? { name } : {}),
          ...(isDefined(source) ? { source } : {}),
          ...(isDefined(consentState) ? { consentState } : {}),
        },
      },
      id: true,
    },
  });
};

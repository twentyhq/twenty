import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export const updateSlackUserLink = async (
  client: CoreApiClient,
  {
    id,
    workspaceMemberId,
    source,
  }: { id: string; workspaceMemberId: string; source?: SlackUserLinkSource },
): Promise<void> => {
  await client.mutation({
    updateSlackUserLink: {
      __args: {
        id,
        data: {
          workspaceMemberId,
          ...(isDefined(source) ? { source } : {}),
        },
      },
      id: true,
    },
  });
};

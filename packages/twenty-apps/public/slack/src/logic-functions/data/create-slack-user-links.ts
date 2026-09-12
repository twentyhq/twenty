import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackUserLinkDraft } from 'src/logic-functions/types/slack-user-link-draft.type';

export const createSlackUserLinks = async (
  client: CoreApiClient,
  { drafts }: { drafts: SlackUserLinkDraft[] },
): Promise<void> => {
  await client.mutation({
    createSlackUserLinks: {
      __args: { data: drafts },
      id: true,
    },
  });
};

import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsUserLinkDraft } from 'src/features/chat/logic-functions/types/teams-user-link-draft.type';

export const createTeamsUserLinks = async ({
  client,
  drafts,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  drafts: TeamsUserLinkDraft[];
}): Promise<void> => {
  await client.mutation({
    createTeamsUserLinks: {
      __args: { data: drafts },
      id: true,
    },
  });
};

import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { findWorkspaceMemberByEmail } from 'src/logic-functions/data/find-workspace-member-by-email';
import { fetchSlackUserEmail } from 'src/logic-functions/utils/fetch-slack-user-email';

// Returns the workspace member the assistant should act as, creating the link
// on first contact when the Slack email matches exactly one member. Returns
// undefined when the Slack user has no counterpart in the workspace.
export const resolveSlackUserLink = async (
  client: CoreApiClient,
  { slackUserId }: { slackUserId: string | undefined },
): Promise<{ workspaceMemberId: string } | undefined> => {
  if (!isNonEmptyString(slackUserId)) {
    return undefined;
  }

  const existingLink = await findSlackUserLink(client, { slackUserId });

  if (existingLink !== undefined) {
    return existingLink;
  }

  const email = await fetchSlackUserEmail(slackUserId);

  if (!isNonEmptyString(email)) {
    return undefined;
  }

  const workspaceMemberId = await findWorkspaceMemberByEmail(client, { email });

  if (!isNonEmptyString(workspaceMemberId)) {
    return undefined;
  }

  // A concurrent event may have created the link already; the unique constraint
  // on slackUserId makes that a conflict rather than a duplicate, and the link
  // we just resolved is the same one either way.
  await createSlackUserLink(client, { slackUserId, workspaceMemberId }).catch(
    () => undefined,
  );

  return { workspaceMemberId };
};

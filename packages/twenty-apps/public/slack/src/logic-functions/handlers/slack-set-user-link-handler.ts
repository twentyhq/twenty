import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackSetUserLinkInput } from 'src/logic-functions/types/slack-set-user-link-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { createApplicationCoreApiClient } from 'src/logic-functions/utils/create-application-core-api-client';
import { currentUserHasWorkspaceMembersPermission } from 'src/logic-functions/utils/current-user-has-workspace-members-permission';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

export const slackSetUserLinkHandler = async ({
  slackUserId,
  workspaceMemberId,
  name,
}: SlackSetUserLinkInput): Promise<SlackToolResult> => {
  if (!(await currentUserHasWorkspaceMembersPermission())) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the workspace members permission can set Slack user links.',
    };
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  const slackTeamId = await getInstalledSlackTeamId(slackClientResult.client);

  if (!isNonEmptyString(slackTeamId)) {
    return {
      success: false,
      message: 'Could not resolve the Slack workspace',
      error: 'Slack did not return a team id for the installed connection.',
    };
  }

  // Slack user link records are APPLICATION-writable, so the write needs the
  // application's own access, not the triggering person's.
  const client = createApplicationCoreApiClient();

  let existingLink: SlackUserLink | undefined;

  try {
    existingLink = await findSlackUserLink(client, {
      slackTeamId,
      slackUserId,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not look up the existing link',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  if (isDefined(existingLink)) {
    await updateSlackUserLink(client, {
      id: existingLink.id,
      workspaceMemberId,
      source: SLACK_USER_LINK_SOURCE.MANUAL,
    });
  } else {
    await createSlackUserLink(client, {
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      name: name ?? slackUserId,
      source: SLACK_USER_LINK_SOURCE.MANUAL,
    });
  }

  return {
    success: true,
    message: `Linked Slack user ${slackUserId} to workspace member ${workspaceMemberId}.`,
  };
};

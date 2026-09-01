import { isDefined } from 'twenty-sdk/utils';

import { type SlackRosterMatchResult } from 'src/logic-functions/types/slack-roster-match.type';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { matchSlackRosterByEmail } from 'src/logic-functions/utils/match-slack-roster-by-email';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const slackMatchUserLinksHandler =
  async (): Promise<SlackRosterMatchResult> => {
    const isAllowed = await currentUserHasRolesPermission();

    if (!isAllowed) {
      return {
        success: false,
        message: 'Not allowed',
        error:
          'Only members with the roles permission can match Slack users to workspace members.',
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

    const slackClient = slackClientResult.client;

    const installedTeamId = await getInstalledSlackTeamId(slackClient);

    if (!isDefined(installedTeamId)) {
      return {
        success: false,
        message: 'Could not verify the installed Slack workspace',
        error:
          'Slack did not confirm the installed workspace. Please try again.',
      };
    }

    try {
      const summary = await matchSlackRosterByEmail({
        slackClient,
        slackTeamId: installedTeamId,
      });

      const messageParts = [
        `Matched ${summary.linkedCount} Slack ${summary.linkedCount === 1 ? 'user' : 'users'} by email.`,
      ];

      if (summary.alreadyLinkedCount > 0) {
        messageParts.push(`${summary.alreadyLinkedCount} already linked.`);
      }

      if (summary.unmatchedCount > 0) {
        messageParts.push(
          `${summary.unmatchedCount} without a matching member email.`,
        );
      }

      if (summary.failedCount > 0) {
        messageParts.push(
          `${summary.failedCount} could not be linked; try the match again.`,
        );
      }

      if (summary.isRosterTruncated) {
        messageParts.push(
          'The Slack roster is too large to scan in one pass, so some users were not checked.',
        );
      }

      return {
        success: true,
        message: messageParts.join(' '),
        ...summary,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Could not match Slack users',
        error: toErrorMessage(error),
      };
    }
  };

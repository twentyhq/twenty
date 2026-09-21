import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { listLinkedSlackUserIds } from 'src/logic-functions/data/list-linked-slack-user-ids';
import { type SlackUnlinkedUsersResult } from 'src/logic-functions/types/slack-unlinked-users.type';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { collectSlackRosterMembers } from 'src/logic-functions/utils/collect-slack-roster-members';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';
import { toSlackUserSearchOption } from 'src/logic-functions/utils/to-slack-user-search-option';

const MAX_UNLINKED_RESULTS = 20;

export const slackListUnlinkedUsersHandler =
  async (): Promise<SlackUnlinkedUsersResult> => {
    const isAllowed = await currentUserHasRolesPermission();

    if (!isAllowed) {
      return {
        success: false,
        message: 'Not allowed',
        error:
          'Only members with the roles permission can list unlinked Slack users.',
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
      const linkedSlackUserIds = await listLinkedSlackUserIds(
        new CoreApiClient({ runAs: 'application' }),
        { slackTeamId: installedTeamId },
      );

      const { members, isTruncated } = await collectSlackRosterMembers({
        slackClient,
        shouldCollectMember: (member) => !linkedSlackUserIds.has(member.id),
        maxMembers: MAX_UNLINKED_RESULTS,
      });

      return {
        success: true,
        slackUsers: members.map((member) =>
          toSlackUserSearchOption({
            member,
            installedSlackTeamId: installedTeamId,
          }),
        ),
        hasMore: isTruncated,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Could not list unlinked Slack users',
        error: toErrorMessage(error),
      };
    }
  };

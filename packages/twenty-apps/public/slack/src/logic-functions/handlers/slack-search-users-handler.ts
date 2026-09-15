import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { type LinkableSlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';
import { type SlackUserSearchResult } from 'src/logic-functions/types/slack-user-search.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { collectSlackRosterMembers } from 'src/logic-functions/utils/collect-slack-roster-members';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';
import { toSlackUserSearchOption } from 'src/logic-functions/utils/to-slack-user-search-option';

const MAX_RESULTS = 10;
const MAX_PAGES = 3;

const matchesQuery = (
  member: LinkableSlackRosterMember,
  query: string,
): boolean =>
  [
    member.real_name,
    member.profile?.display_name,
    member.profile?.email,
    member.id,
  ].some(
    (value) => isNonEmptyString(value) && value.toLowerCase().includes(query),
  );

export const slackSearchUsersHandler = async (
  payload: SlackRouteBody,
): Promise<SlackUserSearchResult> => {
  const isAllowed = await currentUserHasRolesPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error: 'Only members with the roles permission can search Slack users.',
    };
  }

  const body = asRecord(payload.body) ?? {};
  const query = readOptionalString(body.query)?.trim().toLowerCase();

  if (!isNonEmptyString(query)) {
    return { success: true, slackUsers: [] };
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
      error: 'Slack did not confirm the installed workspace. Please try again.',
    };
  }

  try {
    const { members } = await collectSlackRosterMembers({
      slackClient,
      shouldCollectMember: (member) => matchesQuery(member, query),
      maxMembers: MAX_RESULTS,
      maxPages: MAX_PAGES,
    });

    return {
      success: true,
      slackUsers: members.map((member) =>
        toSlackUserSearchOption({
          member,
          installedSlackTeamId: installedTeamId,
        }),
      ),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Could not search Slack users',
      error: toErrorMessage(error),
    };
  }
};

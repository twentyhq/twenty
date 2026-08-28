import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import {
  type SlackUserSearchOption,
  type SlackUserSearchResult,
} from 'src/logic-functions/types/slack-user-search.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { currentUserHasWorkspaceMembersPermission } from 'src/logic-functions/utils/current-user-has-workspace-members-permission';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

const SLACKBOT_USER_ID = 'USLACKBOT';
const MAX_RESULTS = 10;
const PAGE_SIZE = 200;
// users.list is Tier 2 rate limited, so cap how deep one search walks the
// roster; larger workspaces still find anyone via a more specific query.
const MAX_PAGES = 3;

type SlackRosterMember = {
  id?: string;
  is_bot?: boolean;
  deleted?: boolean;
  real_name?: string;
  profile?: { display_name?: string; email?: string };
};

// Guests stay listed on purpose: unlike the auto-match, an admin may link a
// restricted account, and the consent DM still reaches it.
const isLinkableRosterMember = (member: SlackRosterMember): boolean =>
  isNonEmptyString(member.id) &&
  member.id !== SLACKBOT_USER_ID &&
  member.is_bot !== true &&
  member.deleted !== true;

const matchesQuery = (member: SlackRosterMember, query: string): boolean =>
  [
    member.real_name,
    member.profile?.display_name,
    member.profile?.email,
    member.id,
  ].some(
    (value) => isNonEmptyString(value) && value.toLowerCase().includes(query),
  );

const toSearchOption = (
  member: SlackRosterMember,
  slackTeamId: string,
): SlackUserSearchOption => ({
  slackUserId: member.id ?? '',
  slackTeamId,
  displayName: [member.profile?.display_name, member.real_name].find(
    isNonEmptyString,
  ),
  email: isNonEmptyString(member.profile?.email)
    ? member.profile.email
    : undefined,
});

const collectMatches = async (
  slackClient: WebClient,
  query: string,
  slackTeamId: string,
): Promise<SlackUserSearchOption[]> => {
  const matches: SlackUserSearchOption[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await slackClient.users.list({
      limit: PAGE_SIZE,
      cursor,
    });

    for (const member of response.members ?? []) {
      if (isLinkableRosterMember(member) && matchesQuery(member, query)) {
        matches.push(toSearchOption(member, slackTeamId));

        if (matches.length >= MAX_RESULTS) {
          return matches;
        }
      }
    }

    cursor = response.response_metadata?.next_cursor;

    if (!isNonEmptyString(cursor)) {
      break;
    }
  }

  return matches;
};

export const slackSearchUsersHandler = async (
  payload: SlackRouteBody,
): Promise<SlackUserSearchResult> => {
  const body = asRecord(payload.body) ?? {};
  const query = readOptionalString(body.query)?.trim().toLowerCase();

  if (!isNonEmptyString(query)) {
    return { success: true, slackUsers: [] };
  }

  const isAllowed = await currentUserHasWorkspaceMembersPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the workspace members permission can search Slack users.',
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

  // The roster is the installed workspace by definition, so its team id
  // stamps every result; without it the results could not be saved.
  const installedTeamId = await getInstalledSlackTeamId(slackClient);

  if (!isDefined(installedTeamId)) {
    return {
      success: false,
      message: 'Could not verify the installed Slack workspace',
      error: 'Slack did not confirm the installed workspace. Please try again.',
    };
  }

  try {
    return {
      success: true,
      slackUsers: await collectMatches(slackClient, query, installedTeamId),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Could not search Slack users',
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type LinkableSlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';
import { isLinkableSlackRosterMember } from 'src/logic-functions/utils/is-linkable-slack-roster-member';

const MEMBERS_PER_PAGE = 200;
const DEFAULT_MAX_PAGES = 5;

type CollectSlackRosterMembersResult = {
  members: LinkableSlackRosterMember[];
  isTruncated: boolean;
};

// users.list is Tier 2 rate limited, so the walk is capped and reports back when
// it stopped before the end of the roster.
export const collectSlackRosterMembers = async ({
  slackClient,
  shouldCollectMember,
  maxMembers,
  maxPages = DEFAULT_MAX_PAGES,
}: {
  slackClient: WebClient;
  shouldCollectMember?: (member: LinkableSlackRosterMember) => boolean;
  maxMembers?: number;
  maxPages?: number;
}): Promise<CollectSlackRosterMembersResult> => {
  const members: LinkableSlackRosterMember[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const response = await slackClient.users.list({
      limit: MEMBERS_PER_PAGE,
      cursor,
    });

    for (const member of response.members ?? []) {
      if (!isLinkableSlackRosterMember(member)) {
        continue;
      }

      if (isDefined(shouldCollectMember) && !shouldCollectMember(member)) {
        continue;
      }

      if (isDefined(maxMembers) && members.length >= maxMembers) {
        return { members, isTruncated: true };
      }

      members.push(member);
    }

    cursor = response.response_metadata?.next_cursor;

    if (!isNonEmptyString(cursor)) {
      return { members, isTruncated: false };
    }
  }

  return { members, isTruncated: true };
};

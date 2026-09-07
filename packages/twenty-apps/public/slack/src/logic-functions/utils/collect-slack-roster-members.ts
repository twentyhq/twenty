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
  const seenSlackUserIds = new Set<string>();
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const response = await slackClient.users.list({
      limit: MEMBERS_PER_PAGE,
      cursor,
    });

    const collectiblePageMembers = (response.members ?? [])
      .filter(isLinkableSlackRosterMember)
      .filter(
        (member) =>
          !isDefined(shouldCollectMember) || shouldCollectMember(member),
      );

    cursor = response.response_metadata?.next_cursor;

    for (const member of collectiblePageMembers) {
      if (seenSlackUserIds.has(member.id)) {
        continue;
      }

      if (isDefined(maxMembers) && members.length >= maxMembers) {
        return { members, isTruncated: true };
      }

      seenSlackUserIds.add(member.id);
      members.push(member);
    }

    if (isDefined(maxMembers) && members.length >= maxMembers) {
      return { members, isTruncated: isNonEmptyString(cursor) };
    }

    if (!isNonEmptyString(cursor)) {
      return { members, isTruncated: false };
    }
  }

  return { members, isTruncated: true };
};

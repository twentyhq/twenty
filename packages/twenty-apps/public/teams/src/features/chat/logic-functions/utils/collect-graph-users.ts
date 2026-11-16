import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import {
  type GraphUser,
  type LinkableGraphUser,
} from 'src/features/chat/logic-functions/types/graph-user.type';
import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';
import { isLinkableGraphUser } from 'src/features/chat/logic-functions/utils/is-linkable-graph-user';

const DEFAULT_MAX_PAGES = 5;

type CollectGraphUsersResult = {
  users: LinkableGraphUser[];
  isTruncated: boolean;
};

export const collectGraphUsers = async ({
  accessToken,
  url,
  shouldCollectUser,
  maxUsers,
  maxPages = DEFAULT_MAX_PAGES,
}: {
  accessToken: string;
  url: string;
  shouldCollectUser?: (user: LinkableGraphUser) => boolean;
  maxUsers?: number;
  maxPages?: number;
}): Promise<CollectGraphUsersResult> => {
  const users: LinkableGraphUser[] = [];
  const seenAadObjectIds = new Set<string>();
  let nextUrl: string | undefined = url;

  for (let page = 0; page < maxPages; page += 1) {
    if (!isNonEmptyString(nextUrl)) {
      return { users, isTruncated: false };
    }

    const pageResult: GraphCollectionPage<GraphUser> = await fetchGraphJson({
      accessToken,
      url: nextUrl,
    });

    const collectibleUsers = (pageResult.value ?? [])
      .filter(isLinkableGraphUser)
      .filter(
        (user) => !isDefined(shouldCollectUser) || shouldCollectUser(user),
      );

    nextUrl = pageResult['@odata.nextLink'];

    for (const user of collectibleUsers) {
      if (seenAadObjectIds.has(user.id)) {
        continue;
      }

      if (isDefined(maxUsers) && users.length >= maxUsers) {
        return { users, isTruncated: true };
      }

      seenAadObjectIds.add(user.id);
      users.push(user);
    }

    if (isDefined(maxUsers) && users.length >= maxUsers) {
      return { users, isTruncated: isNonEmptyString(nextUrl) };
    }
  }

  return { users, isTruncated: isNonEmptyString(nextUrl) };
};

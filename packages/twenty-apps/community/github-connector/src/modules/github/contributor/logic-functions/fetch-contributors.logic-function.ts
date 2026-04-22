import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  fetchContributors,
  type GqlContributor,
} from 'src/modules/github/contributor/graphql/github/fetch-contributors';
import { batchUpsertContributors } from 'src/modules/github/contributor/graphql/mutations/batch-upsert';
import { isFixtureAllowed } from 'src/modules/shared/fixtures';

export type FetchContributorsFixturePage = {
  contributors: GqlContributor[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type FetchContributorsPayload = {
  owner: string;
  repo: string;
  cursor?: string | null;
  fixturePage?: FetchContributorsFixturePage;
};

const handler = async (event: RoutePayload<FetchContributorsPayload>) => {
  const { owner, repo, cursor = null, fixturePage } = event.body ?? {};
  if (!owner || !repo) {
    return { error: 'owner and repo are required' };
  }

  const result =
    fixturePage && isFixtureAllowed()
      ? fixturePage
      : await fetchContributors(owner, repo, cursor);
  const { contributors, totalCount, hasMore, endCursor } = result;

  if (contributors.length === 0) {
    return { contributorCount: 0, totalCount, hasMore: false, endCursor: null };
  }

  const contributorData = contributors.map((c: GqlContributor) => ({
    ghLogin: c.login,
    name: c.login,
    githubId: c.databaseId ?? 0,
    avatarUrl: c.avatarUrl
      ? { primaryLinkLabel: c.login, primaryLinkUrl: c.avatarUrl, secondaryLinks: null }
      : null,
  }));

  await batchUpsertContributors(contributorData);

  return {
    contributorCount: contributors.length,
    totalCount,
    hasMore,
    endCursor,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'ed9ba981-4172-4924-a18f-51fc6dcbcb23',
  name: 'fetch-contributors',
  description:
    'Fetches one page of contributors via GitHub GraphQL API and batch upserts them into the workspace.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/fetch-contributors',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  fetchContributorsGraphQL,
  type GqlContributor,
} from 'src/modules/github/connector/graphql';
import { batchUpsertEngineers } from 'src/modules/engineer/graphql/mutations/batch-upsert';

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
  orgMembers: string[];
  fixturePage?: FetchContributorsFixturePage;
};

const handler = async (event: RoutePayload<FetchContributorsPayload>) => {
  console.log('[fetch-contributors] Handler invoked');
  console.log('[fetch-contributors] Event body:', JSON.stringify(event.body));

  const {
    owner,
    repo,
    cursor = null,
    orgMembers = [],
    fixturePage,
  } = event.body ?? {};
  if (!owner || !repo) {
    return { error: 'owner and repo are required' };
  }

  const coreTeamLogins = new Set(orgMembers);

  const result = fixturePage
    ?? (await fetchContributorsGraphQL(owner, repo, cursor));
  const { contributors, totalCount, hasMore, endCursor } = result;

  if (contributors.length === 0) {
    return { contributorCount: 0, totalCount, hasMore: false, endCursor: null };
  }

  const engineerData = contributors.map((c: GqlContributor) => ({
    ghLogin: c.login,
    name: c.login,
    githubId: c.databaseId ?? 0,
    avatarUrl: c.avatarUrl
      ? { primaryLinkLabel: c.login, primaryLinkUrl: c.avatarUrl, secondaryLinks: null }
      : null,
    isCoreTeam: coreTeamLogins.has(c.login),
  }));

  await batchUpsertEngineers(engineerData);

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
    'Fetches one page of contributors via GitHub GraphQL API and batch upserts them as engineers with core team flag',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/fetch-contributors',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

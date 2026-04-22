import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  fetchContributorCount,
  fetchOrgMembersGraphQL,
} from 'src/modules/github/connector/graphql';
import { getDefaultGithubOrg } from 'src/modules/github/connector/config';

const PAGE_SIZE = 100;

type CountContributorsPayload = {
  owner?: string;
  repo?: string;
};

const handler = async (event: RoutePayload<CountContributorsPayload>) => {
  console.log('[count-contributors] Handler invoked');
  console.log('[count-contributors] Event body:', JSON.stringify(event.body));

  const owner = event.body?.owner ?? 'twentyhq';
  const repo = event.body?.repo ?? 'twenty';

  console.log(`[count-contributors] Starting count for ${owner}/${repo}`);
  console.log('[count-contributors] Fetching contributor count and org members in parallel...');

  const [totalCount, orgMembers] = await Promise.all([
    fetchContributorCount(owner, repo).then((count) => {
      console.log(`[count-contributors] Contributor count: ${count}`);
      return count;
    }),
    fetchOrgMembersGraphQL(getDefaultGithubOrg())
      .then((members) => {
        console.log(`[count-contributors] Org members: ${members.size}`);
        return [...members];
      })
      .catch((err) => {
        console.log(`[count-contributors] Org members query failed (non-fatal): ${err instanceof Error ? err.message : err}`);
        return [] as string[];
      }),
  ]);

  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  console.log(`[count-contributors] Done — ${totalCount} contributors, ${totalPages} pages, ${orgMembers.length} org members`);

  return {
    totalCount,
    totalPages,
    orgMembers,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'fe0a6f00-0d63-4cb9-9b3c-1d8186181830',
  name: 'count-contributors',
  description:
    'Counts total contributor pages and pre-fetches org members for core team detection',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-contributors',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

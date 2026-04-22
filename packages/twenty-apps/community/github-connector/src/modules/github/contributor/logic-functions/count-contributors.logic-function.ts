import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { fetchContributorCount } from 'src/modules/github/connector/graphql';

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

  const totalCount = await fetchContributorCount(owner, repo);
  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  console.log(
    `[count-contributors] Done — ${totalCount} contributors, ${totalPages} pages`,
  );

  return {
    totalCount,
    totalPages,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'fe0a6f00-0d63-4cb9-9b3c-1d8186181830',
  name: 'count-contributors',
  description:
    'Counts the total contributors of a GitHub repository and returns the number of pages to fetch.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-contributors',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

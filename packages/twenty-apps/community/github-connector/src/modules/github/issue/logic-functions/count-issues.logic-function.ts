import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { fetchIssueCount } from 'src/modules/github/connector/graphql';
import { getGithubRepos } from 'src/modules/github/connector/config';

const PAGE_SIZE = 100;

type CountIssuesPayload = {
  repos?: string[];
};

const handler = async (event: RoutePayload<CountIssuesPayload>) => {
  const repos = event.body?.repos ?? getGithubRepos();

  const repoCounts: Array<{
    owner: string;
    repo: string;
    totalCount: number;
    pages: number;
  }> = [];
  let totalPages = 0;

  for (const fullRepo of repos) {
    const [owner, repo] = fullRepo.split('/');
    const totalCount = await fetchIssueCount(owner, repo);
    const pages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
    repoCounts.push({ owner, repo, totalCount, pages });
    totalPages += pages;
  }

  return { totalPages, repos: repoCounts };
};

export default defineLogicFunction({
  universalIdentifier: 'd8cc32bf-6be9-44fc-920a-8bba510f045f',
  name: 'count-issues',
  description: 'Counts total issue pages across configured repos using GraphQL totalCount',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-issues',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

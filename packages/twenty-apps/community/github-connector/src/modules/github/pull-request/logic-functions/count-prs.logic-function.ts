import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { fetchPullRequestCount } from 'src/modules/github/connector/graphql';
import { getGithubRepos } from 'src/modules/github/connector/config';

const PAGE_SIZE = 100;

type CountPrsPayload = {
  repos?: string[];
};

const handler = async (event: RoutePayload<CountPrsPayload>) => {
  const bodyRepos = event.body?.repos;
  const repos =
    bodyRepos && bodyRepos.length > 0 ? bodyRepos : getGithubRepos();

  const repoCounts: Array<{
    owner: string;
    repo: string;
    totalCount: number;
    pages: number;
  }> = [];
  let totalPages = 0;

  for (const fullRepo of repos) {
    const [owner, repo] = fullRepo.split('/');
    const totalCount = await fetchPullRequestCount(owner, repo);
    const pages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
    repoCounts.push({ owner, repo, totalCount, pages });
    totalPages += pages;
  }

  return { totalPages, repos: repoCounts };
};

export default defineLogicFunction({
  universalIdentifier: '082227ae-2acc-4320-8d31-62ad6c443da6',
  name: 'count-prs',
  description: 'Counts total PR pages across configured repos using GraphQL totalCount',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-prs',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

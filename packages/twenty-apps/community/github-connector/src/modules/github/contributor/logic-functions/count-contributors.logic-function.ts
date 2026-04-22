import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { fetchContributorCount } from 'src/modules/github/connector/graphql';
import {
  getGithubRepos,
  parseGithubRepo,
} from 'src/modules/github/connector/config';

const PAGE_SIZE = 100;

type CountContributorsPayload = {
  repos?: string[];
};

const handler = async (event: RoutePayload<CountContributorsPayload>) => {
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
    const parsed = parseGithubRepo(fullRepo);
    if (!parsed) {
      console.warn(
        `[count-contributors] Skipping malformed repo entry: ${fullRepo}`,
      );
      continue;
    }
    const { owner, repo } = parsed;
    const totalCount = await fetchContributorCount(owner, repo);
    const pages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
    repoCounts.push({ owner, repo, totalCount, pages });
    totalPages += pages;
  }

  return { totalPages, repos: repoCounts };
};

export default defineLogicFunction({
  universalIdentifier: 'fe0a6f00-0d63-4cb9-9b3c-1d8186181830',
  name: 'count-contributors',
  description:
    'Counts contributors across configured repos and returns the per-repo page split.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/count-contributors',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

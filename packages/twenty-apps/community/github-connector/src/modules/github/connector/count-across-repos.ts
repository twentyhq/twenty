import {
  getGithubRepos,
  parseGithubRepo,
} from 'src/modules/github/connector/config';

export type RepoCount = {
  owner: string;
  repo: string;
  totalCount: number;
  pages: number;
};

export type CountAcrossReposResult = {
  totalPages: number;
  repos: RepoCount[];
};

const PAGE_SIZE = 100;

export async function countAcrossRepos(
  bodyRepos: string[] | undefined,
  count: (owner: string, repo: string) => Promise<number>,
  logTag: string,
): Promise<CountAcrossReposResult> {
  const repos =
    bodyRepos && bodyRepos.length > 0 ? bodyRepos : getGithubRepos();

  const results: RepoCount[] = [];
  let totalPages = 0;

  for (const fullRepo of repos) {
    const parsed = parseGithubRepo(fullRepo);
    if (!parsed) {
      console.warn(`[${logTag}] Skipping malformed repo entry: ${fullRepo}`);
      continue;
    }
    const { owner, repo } = parsed;
    const totalCount = await count(owner, repo);
    const pages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
    results.push({ owner, repo, totalCount, pages });
    totalPages += pages;
  }

  return { totalPages, repos: results };
}

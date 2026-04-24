import { githubGraphql } from 'src/modules/github/connector/github-client';

const QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    pullRequests(states: [OPEN, CLOSED, MERGED]) {
      totalCount
    }
  }
}`;

type Response = {
  repository: { pullRequests: { totalCount: number } } | null;
};

export async function countPullRequests(
  owner: string,
  name: string,
): Promise<number> {
  try {
    const data = await githubGraphql<Response>(QUERY, { owner, name });
    return data.repository?.pullRequests.totalCount ?? 0;
  } catch {
    return 0;
  }
}

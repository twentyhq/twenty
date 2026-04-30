import { githubGraphql } from 'src/modules/github/connector/github-client';

const QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    issues(states: [OPEN, CLOSED]) {
      totalCount
    }
  }
}`;

type Response = {
  repository: { issues: { totalCount: number } } | null;
};

export async function countIssues(
  owner: string,
  name: string,
): Promise<number> {
  try {
    const data = await githubGraphql<Response>(QUERY, { owner, name });
    return data.repository?.issues.totalCount ?? 0;
  } catch {
    return 0;
  }
}

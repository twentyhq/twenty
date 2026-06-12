import { githubGraphql } from 'src/modules/github/connector/github-client';

const QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    mentionableUsers { totalCount }
  }
}`;

type Response = {
  repository: { mentionableUsers: { totalCount: number } } | null;
};

export async function countContributors(
  owner: string,
  name: string,
): Promise<number> {
  const data = await githubGraphql<Response>(QUERY, { owner, name });
  return data.repository?.mentionableUsers.totalCount ?? 0;
}

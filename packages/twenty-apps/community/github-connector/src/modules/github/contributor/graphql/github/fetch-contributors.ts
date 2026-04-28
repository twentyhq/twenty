import {
  EMPTY_PAGE,
  type GithubPage,
  githubGraphql,
} from 'src/modules/github/connector/github-client';

const QUERY = `
query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    mentionableUsers(first: 100, after: $cursor) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        login
        databaseId
        avatarUrl
      }
    }
  }
}`;

export type GqlContributor = {
  login: string;
  databaseId: number;
  avatarUrl: string;
};

type Response = {
  repository: { mentionableUsers: GithubPage<GqlContributor> } | null;
};

export async function fetchContributors(
  owner: string,
  name: string,
  cursor: string | null = null,
): Promise<{
  contributors: GqlContributor[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
}> {
  const data = await githubGraphql<Response>(QUERY, { owner, name, cursor });
  const conn = data.repository?.mentionableUsers;
  if (!conn) return { contributors: [], ...EMPTY_PAGE };

  return {
    contributors: conn.nodes,
    totalCount: conn.totalCount,
    hasMore: conn.pageInfo.hasNextPage,
    endCursor: conn.pageInfo.endCursor,
  };
}

import {
  EMPTY_PAGE,
  type GithubPage,
  githubGraphql,
} from 'src/modules/github/connector/github-client';

const QUERY = `
query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: 100, states: [OPEN, CLOSED, MERGED], orderBy: {field: CREATED_AT, direction: DESC}, after: $cursor) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        number
        title
        url
        state
        merged
        mergedAt
        closedAt
        createdAt
        author { login avatarUrl ... on User { databaseId } }
        mergedBy { login avatarUrl ... on User { databaseId } }
        reviews(first: 100) {
          nodes {
            databaseId
            state
            submittedAt
            author { login avatarUrl ... on User { databaseId } }
          }
        }
      }
    }
  }
}`;

export type GqlPullRequest = {
  number: number;
  title: string;
  url: string;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  merged: boolean;
  mergedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  author: { login: string; avatarUrl?: string | null; databaseId?: number } | null;
  mergedBy: { login: string; avatarUrl?: string | null; databaseId?: number } | null;
  reviews: {
    nodes: Array<{
      databaseId: number;
      state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
      submittedAt: string | null;
      author: { login: string; avatarUrl?: string | null; databaseId?: number } | null;
    }>;
  };
};

type Response = {
  repository: { pullRequests: GithubPage<GqlPullRequest> } | null;
};

export async function fetchPullRequests(
  owner: string,
  name: string,
  cursor: string | null = null,
): Promise<{
  prs: GqlPullRequest[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
}> {
  const data = await githubGraphql<Response>(QUERY, { owner, name, cursor });
  const conn = data.repository?.pullRequests;
  if (!conn) return { prs: [], ...EMPTY_PAGE };

  return {
    prs: conn.nodes,
    totalCount: conn.totalCount,
    hasMore: conn.pageInfo.hasNextPage,
    endCursor: conn.pageInfo.endCursor,
  };
}

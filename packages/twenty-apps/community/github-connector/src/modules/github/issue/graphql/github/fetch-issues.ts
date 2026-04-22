import {
  EMPTY_PAGE,
  type GithubPage,
  githubGraphql,
} from 'src/modules/github/connector/github-client';

const QUERY = `
query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    issues(first: 100, states: [OPEN, CLOSED], orderBy: {field: CREATED_AT, direction: DESC}, after: $cursor) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        number
        title
        url
        state
        createdAt
        closedAt
        author { login avatarUrl ... on User { databaseId } }
        labels(first: 50) { nodes { name } }
      }
    }
  }
}`;

export type GqlIssue = {
  number: number;
  title: string;
  url: string;
  state: 'OPEN' | 'CLOSED';
  createdAt: string;
  closedAt: string | null;
  author: { login: string; avatarUrl?: string | null; databaseId?: number } | null;
  labels: { nodes: Array<{ name: string }> };
};

type Response = {
  repository: { issues: GithubPage<GqlIssue> } | null;
};

export async function fetchIssues(
  owner: string,
  name: string,
  cursor: string | null = null,
): Promise<{
  issues: GqlIssue[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
}> {
  try {
    const data = await githubGraphql<Response>(QUERY, { owner, name, cursor });
    const conn = data.repository?.issues;
    if (!conn) return { issues: [], ...EMPTY_PAGE };

    return {
      issues: conn.nodes,
      totalCount: conn.totalCount,
      hasMore: conn.pageInfo.hasNextPage,
      endCursor: conn.pageInfo.endCursor,
    };
  } catch {
    return { issues: [], ...EMPTY_PAGE };
  }
}

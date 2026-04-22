import { getGitHubToken } from './auth';
import type { ProjectV2Item } from './types';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export class GitHubRateLimitError extends Error {
  constructor(
    message: string,
    public readonly kind: 'primary' | 'secondary',
    public readonly remaining: number | null,
    public readonly limit: number | null,
    public readonly resetAt: Date | null,
    public readonly retryAfterSeconds: number | null,
  ) {
    super(message);
    this.name = 'GitHubRateLimitError';
  }
}

function readRateLimitHeaders(res: Response) {
  const num = (h: string) => {
    const v = res.headers.get(h);
    return v === null ? null : Number(v);
  };
  const reset = num('x-ratelimit-reset');
  return {
    limit: num('x-ratelimit-limit'),
    remaining: num('x-ratelimit-remaining'),
    used: num('x-ratelimit-used'),
    resource: res.headers.get('x-ratelimit-resource'),
    resetAt: reset === null || Number.isNaN(reset) ? null : new Date(reset * 1000),
    retryAfter: num('retry-after'),
  };
}

const LOW_REMAINING_THRESHOLD = 200;

async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const queryName = query.match(/query\s*\(/)
    ? query.slice(0, 60).replace(/\s+/g, ' ').trim()
    : 'mutation';
  console.log(`[github-gql] Executing: ${queryName} vars=${JSON.stringify(Object.keys(variables))}`);
  const token = await getGitHubToken();
  console.log('[github-gql] Token acquired, sending request...');
  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const rl = readRateLimitHeaders(res);
  if (rl.remaining !== null && rl.limit !== null) {
    const resetIn = rl.resetAt
      ? Math.max(0, Math.round((rl.resetAt.getTime() - Date.now()) / 1000))
      : null;
    const isLow =
      rl.remaining <= LOW_REMAINING_THRESHOLD ||
      rl.remaining / rl.limit < 0.1;
    const tag = isLow ? '[github-gql][rate-limit-low]' : '[github-gql][rate-limit]';
    console.log(
      `${tag} resource=${rl.resource ?? 'graphql'} remaining=${rl.remaining}/${rl.limit} used=${rl.used ?? '?'} resetIn=${resetIn ?? '?'}s`,
    );
  }

  if (!res.ok) {
    const body = await res.text();
    const lower = body.toLowerCase();
    const isSecondary =
      res.status === 403 &&
      (lower.includes('secondary rate limit') || lower.includes('abuse detection'));
    const isPrimary =
      (res.status === 403 || res.status === 429) &&
      lower.includes('rate limit') &&
      !isSecondary;

    if (isPrimary || isSecondary) {
      throw new GitHubRateLimitError(
        `GitHub ${isSecondary ? 'secondary' : 'primary'} rate limit hit (${res.status}): ${body.slice(0, 200)}`,
        isSecondary ? 'secondary' : 'primary',
        rl.remaining,
        rl.limit,
        rl.resetAt,
        rl.retryAfter,
      );
    }

    throw new Error(
      `GitHub GraphQL ${res.status} ${res.statusText}: ${body.slice(0, 500)}`,
    );
  }

  const json = (await res.json()) as {
    data: T;
    errors?: Array<{ type?: string; message: string }>;
  };

  if (json.errors?.length) {
    const isRateLimited = json.errors.some(
      (e) => e.type === 'RATE_LIMITED' || /rate limit/i.test(e.message),
    );
    if (isRateLimited) {
      throw new GitHubRateLimitError(
        `GitHub GraphQL RATE_LIMITED: ${json.errors.map((e) => e.message).join(', ')}`,
        'primary',
        rl.remaining,
        rl.limit,
        rl.resetAt,
        rl.retryAfter,
      );
    }
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join(', ')}`,
    );
  }

  return json.data;
}

// ---------- Pull Requests with Reviews ----------

const PULL_REQUESTS_QUERY = `
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
        author { login ... on User { databaseId } }
        mergedBy { login ... on User { databaseId } }
        reviews(first: 100) {
          nodes {
            databaseId
            state
            submittedAt
            author { login ... on User { databaseId } }
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
  author: { login: string; databaseId?: number } | null;
  mergedBy: { login: string; databaseId?: number } | null;
  reviews: {
    nodes: Array<{
      databaseId: number;
      state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
      submittedAt: string | null;
      author: { login: string; databaseId?: number } | null;
    }>;
  };
};

type PullRequestsResponse = {
  repository: {
    pullRequests: {
      totalCount: number;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: GqlPullRequest[];
    };
  } | null;
};

export async function fetchPullRequestsGraphQL(
  owner: string,
  name: string,
  cursor: string | null = null,
): Promise<{
  prs: GqlPullRequest[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
}> {
  const data = await graphql<PullRequestsResponse>(PULL_REQUESTS_QUERY, {
    owner,
    name,
    cursor,
  });

  if (!data.repository) {
    return { prs: [], totalCount: 0, hasMore: false, endCursor: null };
  }

  const connection = data.repository.pullRequests;

  return {
    prs: connection.nodes,
    totalCount: connection.totalCount,
    hasMore: connection.pageInfo.hasNextPage,
    endCursor: connection.pageInfo.endCursor,
  };
}

// ---------- PR count (lightweight, no node data) ----------

const PR_COUNT_QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    pullRequests(states: [OPEN, CLOSED, MERGED]) {
      totalCount
    }
  }
}`;

type PrCountResponse = {
  repository: { pullRequests: { totalCount: number } } | null;
};

export async function fetchPullRequestCount(
  owner: string,
  name: string,
): Promise<number> {
  try {
    const data = await graphql<PrCountResponse>(PR_COUNT_QUERY, {
      owner,
      name,
    });
    return data.repository?.pullRequests.totalCount ?? 0;
  } catch {
    return 0;
  }
}

// ---------- Issues ----------

const ISSUES_QUERY = `
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
        author { login ... on User { databaseId } }
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
  author: { login: string; databaseId?: number } | null;
  labels: { nodes: Array<{ name: string }> };
};

type IssuesResponse = {
  repository: {
    issues: {
      totalCount: number;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: GqlIssue[];
    };
  } | null;
};

export async function fetchIssuesGraphQL(
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
    const data = await graphql<IssuesResponse>(ISSUES_QUERY, {
      owner,
      name,
      cursor,
    });

    if (!data.repository) {
      return { issues: [], totalCount: 0, hasMore: false, endCursor: null };
    }

    const connection = data.repository.issues;

    return {
      issues: connection.nodes,
      totalCount: connection.totalCount,
      hasMore: connection.pageInfo.hasNextPage,
      endCursor: connection.pageInfo.endCursor,
    };
  } catch {
    return { issues: [], totalCount: 0, hasMore: false, endCursor: null };
  }
}

// ---------- Issue count (lightweight, no node data) ----------

const ISSUE_COUNT_QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    issues(states: [OPEN, CLOSED]) {
      totalCount
    }
  }
}`;

type IssueCountResponse = {
  repository: { issues: { totalCount: number } } | null;
};

export async function fetchIssueCount(
  owner: string,
  name: string,
): Promise<number> {
  try {
    const data = await graphql<IssueCountResponse>(ISSUE_COUNT_QUERY, {
      owner,
      name,
    });
    return data.repository?.issues.totalCount ?? 0;
  } catch {
    return 0;
  }
}

// ---------- Project Items ----------

const PROJECT_ITEMS_QUERY = `
query($owner: String!, $number: Int!, $cursor: String) {
  organization(login: $owner) {
    projectV2(number: $number) {
      items(first: 100, after: $cursor) {
        totalCount
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          content {
            __typename
            ... on Issue {
              title
              number
              url
              repository { nameWithOwner }
            }
            ... on PullRequest {
              title
              number
              url
              repository { nameWithOwner }
            }
            ... on DraftIssue {
              title
            }
          }
          fieldValues(first: 20) {
            nodes {
              __typename
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2SingleSelectField { name } }
              }
              ... on ProjectV2ItemFieldIterationValue {
                title
                field { ... on ProjectV2IterationField { name } }
              }
              ... on ProjectV2ItemFieldTextValue {
                text
                field { ... on ProjectV2Field { name } }
              }
              ... on ProjectV2ItemFieldNumberValue {
                number
                field { ... on ProjectV2Field { name } }
              }
              ... on ProjectV2ItemFieldUserValue {
                users(first: 10) { nodes { login } }
                field { ... on ProjectV2Field { name } }
              }
            }
          }
        }
      }
    }
  }
}`;

const PROJECT_ITEMS_USER_QUERY = PROJECT_ITEMS_QUERY.replace(
  'organization(login: $owner)',
  'user(login: $owner)',
);

type ProjectItemsConnection = {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: ProjectV2Item[];
};

type ProjectItemsResponse = {
  organization: { projectV2: { items: ProjectItemsConnection } | null } | null;
};

type ProjectItemsUserResponse = {
  user: { projectV2: { items: ProjectItemsConnection } | null } | null;
};

/**
 * Swallows GraphQL `Could not resolve to a (User|Organization)` errors so we
 * can probe both `user(login)` and `organization(login)` without crashing
 * when the login only matches one of them.
 */
async function tryGraphqlByOwnerKind<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  try {
    return await graphql<T>(query, variables);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (/Could not resolve to a (User|Organization)/i.test(msg)) return null;
    throw err;
  }
}

export async function fetchProjectItemsPage(
  owner: string,
  projectNumber: number,
  cursor: string | null = null,
): Promise<{
  items: ProjectV2Item[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
}> {
  const orgData = await tryGraphqlByOwnerKind<ProjectItemsResponse>(
    PROJECT_ITEMS_QUERY,
    { owner, number: projectNumber, cursor },
  );

  let connection: ProjectItemsConnection | undefined =
    orgData?.organization?.projectV2?.items;

  if (!connection) {
    const userData = await tryGraphqlByOwnerKind<ProjectItemsUserResponse>(
      PROJECT_ITEMS_USER_QUERY,
      { owner, number: projectNumber, cursor },
    );
    connection = userData?.user?.projectV2?.items;
  }

  if (!connection) {
    console.warn(
      `[github-gql] project ${owner}/${projectNumber} returned no items (project does not exist or the configured token lacks read access — for classic PATs add the \`read:project\` scope, for fine-grained PATs grant Organization → Projects: Read).`,
    );
    return { items: [], totalCount: 0, hasMore: false, endCursor: null };
  }

  return {
    items: connection.nodes,
    totalCount: connection.totalCount,
    hasMore: connection.pageInfo.hasNextPage,
    endCursor: connection.pageInfo.endCursor,
  };
}

// ---------- Single project item by node ID (used by webhook) ----------

const PROJECT_ITEM_BY_NODE_ID_QUERY = `
query($id: ID!) {
  node(id: $id) {
    ... on ProjectV2Item {
      id
      content {
        __typename
        ... on Issue {
          title
          number
          url
          repository { nameWithOwner }
        }
        ... on PullRequest {
          title
          number
          url
          repository { nameWithOwner }
        }
        ... on DraftIssue {
          title
        }
      }
      fieldValues(first: 20) {
        nodes {
          __typename
          ... on ProjectV2ItemFieldSingleSelectValue {
            name
            field { ... on ProjectV2SingleSelectField { name } }
          }
          ... on ProjectV2ItemFieldIterationValue {
            title
            field { ... on ProjectV2IterationField { name } }
          }
          ... on ProjectV2ItemFieldTextValue {
            text
            field { ... on ProjectV2Field { name } }
          }
          ... on ProjectV2ItemFieldNumberValue {
            number
            field { ... on ProjectV2Field { name } }
          }
          ... on ProjectV2ItemFieldUserValue {
            users(first: 10) { nodes { login } }
            field { ... on ProjectV2Field { name } }
          }
        }
      }
    }
  }
}`;

type ProjectItemNodeResponse = {
  node: ProjectV2Item | null;
};

export async function fetchProjectItemByNodeId(
  nodeId: string,
): Promise<ProjectV2Item | null> {
  try {
    const data = await graphql<ProjectItemNodeResponse>(
      PROJECT_ITEM_BY_NODE_ID_QUERY,
      { id: nodeId },
    );
    return data.node;
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Could not resolve') || msg.includes('global id')) {
      return null;
    }
    throw err;
  }
}

// ---------- Project Items count (lightweight) ----------

const PROJECT_ITEMS_COUNT_QUERY = `
query($owner: String!, $number: Int!) {
  organization(login: $owner) {
    projectV2(number: $number) {
      items { totalCount }
    }
  }
}`;

const PROJECT_ITEMS_COUNT_USER_QUERY = PROJECT_ITEMS_COUNT_QUERY.replace(
  'organization(login: $owner)',
  'user(login: $owner)',
);

type ProjectItemsCountResponse = {
  organization: { projectV2: { items: { totalCount: number } } | null } | null;
};

type ProjectItemsCountUserResponse = {
  user: { projectV2: { items: { totalCount: number } } | null } | null;
};

export async function fetchProjectItemCount(
  owner: string,
  projectNumber: number,
): Promise<number> {
  const orgData = await tryGraphqlByOwnerKind<ProjectItemsCountResponse>(
    PROJECT_ITEMS_COUNT_QUERY,
    { owner, number: projectNumber },
  );
  const orgCount = orgData?.organization?.projectV2?.items.totalCount;
  if (typeof orgCount === 'number') return orgCount;

  const userData = await tryGraphqlByOwnerKind<ProjectItemsCountUserResponse>(
    PROJECT_ITEMS_COUNT_USER_QUERY,
    { owner, number: projectNumber },
  );
  return userData?.user?.projectV2?.items.totalCount ?? 0;
}

// ---------- Contributors (mentionableUsers) ----------

const CONTRIBUTORS_QUERY = `
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

type ContributorsResponse = {
  repository: {
    mentionableUsers: {
      totalCount: number;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: GqlContributor[];
    };
  } | null;
};

export async function fetchContributorsGraphQL(
  owner: string,
  name: string,
  cursor: string | null = null,
): Promise<{
  contributors: GqlContributor[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
}> {
  const data = await graphql<ContributorsResponse>(CONTRIBUTORS_QUERY, {
    owner,
    name,
    cursor,
  });

  if (!data.repository) {
    return { contributors: [], totalCount: 0, hasMore: false, endCursor: null };
  }

  const connection = data.repository.mentionableUsers;

  return {
    contributors: connection.nodes,
    totalCount: connection.totalCount,
    hasMore: connection.pageInfo.hasNextPage,
    endCursor: connection.pageInfo.endCursor,
  };
}

// ---------- Contributor count (lightweight, no node data) ----------

const CONTRIBUTOR_COUNT_QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    mentionableUsers { totalCount }
  }
}`;

type ContributorCountResponse = {
  repository: { mentionableUsers: { totalCount: number } } | null;
};

export async function fetchContributorCount(
  owner: string,
  name: string,
): Promise<number> {
  const data = await graphql<ContributorCountResponse>(
    CONTRIBUTOR_COUNT_QUERY,
    { owner, name },
  );
  return data.repository?.mentionableUsers.totalCount ?? 0;
}

export function extractAssigneeLogins(item: ProjectV2Item): string[] {
  for (const fv of item.fieldValues.nodes) {
    if (!fv.field || fv.field.name !== 'Assignees') continue;
    if (fv.__typename === 'ProjectV2ItemFieldUserValue') {
      return (fv as { users: { nodes: Array<{ login: string }> } })
        .users.nodes.map((u) => u.login);
    }
  }
  return [];
}

export function extractFieldValue(
  item: ProjectV2Item,
  fieldName: string,
): string {
  for (const fv of item.fieldValues.nodes) {
    if (!fv.field || fv.field.name !== fieldName) continue;

    switch (fv.__typename) {
      case 'ProjectV2ItemFieldSingleSelectValue':
        return (fv as { name: string }).name;
      case 'ProjectV2ItemFieldIterationValue':
        return (fv as { title: string }).title;
      case 'ProjectV2ItemFieldTextValue':
        return (fv as { text: string }).text;
      case 'ProjectV2ItemFieldNumberValue':
        return String((fv as { number: number }).number);
      case 'ProjectV2ItemFieldUserValue': {
        const users = (fv as { users: { nodes: Array<{ login: string }> } })
          .users.nodes;
        return users.map((u) => u.login).join(', ');
      }
    }
  }
  return '';
}

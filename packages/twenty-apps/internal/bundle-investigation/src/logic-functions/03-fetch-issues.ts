import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { createSign } from 'crypto';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const ISSUES_QUERY = `
query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    issues(first: 10, states: [OPEN, CLOSED], orderBy: {field: CREATED_AT, direction: DESC}, after: $cursor) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        number title url state createdAt closedAt
        author { login ... on User { databaseId } }
        labels(first: 50) { nodes { name } }
      }
    }
  }
}`;

type GqlIssue = {
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

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function signJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({ iat: now - 60, exp: now + 600, iss: appId }),
  );
  const signature = createSign('RSA-SHA256')
    .update(`${header}.${payload}`)
    .sign(privateKey, 'base64url');
  return `${header}.${payload}.${signature}`;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getGithubToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.token;
  }
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  if (!appId || !privateKey || !installationId) {
    throw new Error('Missing GitHub App credentials');
  }
  const jwt = signJwt(appId, privateKey);
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json' },
    },
  );
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = (await res.json()) as { token: string; expires_at: string };
  cachedToken = { token: data.token, expiresAt: new Date(data.expires_at).getTime() };
  return cachedToken.token;
}

async function gh<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = await getGithubToken();
  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(', '));
  return json.data;
}

type Payload = { owner: string; repo: string; cursor?: string | null };

const handler = async (event: RoutePayload<Payload>) => {
  const { owner, repo, cursor = null } = event.body ?? {};
  if (!owner || !repo) return { error: 'owner and repo are required' };

  const data = await gh<IssuesResponse>(ISSUES_QUERY, { owner, name: repo, cursor });
  if (!data.repository) return { issues: 0, totalCount: 0, hasMore: false, endCursor: null };

  const { nodes, totalCount, pageInfo } = data.repository.issues;

  const seen = new Map<string, { ghLogin: string; githubId: number }>();
  for (const i of nodes) {
    if (i.author?.login && !seen.has(i.author.login)) {
      seen.set(i.author.login, {
        ghLogin: i.author.login,
        githubId: i.author.databaseId ?? 0,
      });
    }
  }
  const engineerInputs = [...seen.values()];

  const client = new CoreApiClient();

  const upserted = engineerInputs.length
    ? await client.mutation({
        createEngineers: {
          __args: { data: engineerInputs, upsert: true },
          id: true,
          ghLogin: true,
        },
      })
    : { createEngineers: [] };

  type Engineer = { id: string; ghLogin?: string };
  const idByLogin = new Map<string, string>();
  for (const e of (upserted.createEngineers ?? []) as Engineer[]) {
    if (e.ghLogin) idByLogin.set(e.ghLogin, e.id);
  }

  const issueData = nodes.map((issue) => ({
    title: issue.title,
    githubNumber: issue.number,
    uniqueIdentifier: `${owner}/${repo}#${issue.number}`,
    state: issue.state,
    repo: `${owner}/${repo}`,
    githubCreatedAt: issue.createdAt,
    closedAt: issue.closedAt,
    labels: issue.labels.nodes.map((l) => l.name),
    authorId: issue.author ? (idByLogin.get(issue.author.login) ?? null) : null,
  }));

  await client.mutation({
    createIssues: {
      __args: { data: issueData, upsert: true },
      id: true,
    },
  });

  return {
    issueCount: nodes.length,
    totalCount,
    hasMore: pageInfo.hasNextPage,
    endCursor: pageInfo.endCursor,
  };
};

export default defineLogicFunction({
  universalIdentifier: '33333333-3333-4333-8333-333333333333',
  name: 'fetch-issues',
  description: 'Realistic fetch-issues clone (mirrors twenty-eng/fetch-issues imports)',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/bundle-investigation/fetch-issues',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});

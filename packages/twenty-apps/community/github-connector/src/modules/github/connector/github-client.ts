import { getGitHubToken } from 'src/modules/github/connector/auth';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const LOW_REMAINING_THRESHOLD = 200;

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
    resetAt:
      reset === null || Number.isNaN(reset) ? null : new Date(reset * 1000),
    retryAfter: num('retry-after'),
  };
}

export async function githubGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const queryName = query.match(/query\s*\(/)
    ? query.slice(0, 60).replace(/\s+/g, ' ').trim()
    : 'mutation';
  console.log(
    `[github-gql] Executing: ${queryName} vars=${JSON.stringify(Object.keys(variables))}`,
  );
  const token = await getGitHubToken();
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
    const tag = isLow
      ? '[github-gql][rate-limit-low]'
      : '[github-gql][rate-limit]';
    console.log(
      `${tag} resource=${rl.resource ?? 'graphql'} remaining=${rl.remaining}/${rl.limit} used=${rl.used ?? '?'} resetIn=${resetIn ?? '?'}s`,
    );
  }

  if (!res.ok) {
    const body = await res.text();
    const lower = body.toLowerCase();
    const isSecondary =
      res.status === 403 &&
      (lower.includes('secondary rate limit') ||
        lower.includes('abuse detection'));
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

export async function githubGraphqlOptional<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> {
  try {
    return await githubGraphql<T>(query, variables);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (/Could not resolve to a (User|Organization)/i.test(msg)) return null;
    throw err;
  }
}

export type GithubPage<T> = {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: T[];
};

export type Paged<TItems extends Record<string, unknown[]>> = TItems & {
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

export const EMPTY_PAGE = {
  totalCount: 0,
  hasMore: false,
  endCursor: null,
} as const;

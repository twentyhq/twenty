const IDENTITY_PATTERNS = [
  /noreply@anthropic\.com/i,
  /@anthropic\.com/i,
  /cursoragent@cursor\.com/i,
  /copilot-swe-agent\[bot\]/i,
];

const SIGNATURE_PATTERNS = [
  /Generated with \[Claude Code\]\(/i,
  /Co-Authored-By:[^\n]*<[^>]*@anthropic\.com>/i,
  /(Generated|Made|Built) with \[Cursor( Agent)?\]\(/i,
  /Co-Authored-By:[^\n]*cursoragent/i,
];

type Commit = {
  sha: string;
  commit: {
    message: string;
    author: { name: string; email: string };
    committer: { name: string; email: string };
  };
};

type ProseSource = {
  kind: string;
  ref: string;
  body: string;
};

async function githubGet<TResponse>(
  url: string,
  token: string,
): Promise<TResponse> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as TResponse;
}

async function githubGetPaginated<TItem>(
  baseUrl: string,
  token: string,
): Promise<TItem[]> {
  const items: TItem[] = [];
  let page = 1;

  for (;;) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    const batch = await githubGet<TItem[]>(
      `${baseUrl}${separator}per_page=100&page=${page}`,
      token,
    );

    items.push(...batch);

    if (batch.length < 100) {
      return items;
    }

    page += 1;
  }
}

function matchPatterns(text: string, patterns: RegExp[]): string[] {
  if (!text) {
    return [];
  }

  return patterns.flatMap((pattern) => {
    const match = text.match(pattern);
    return match ? [match[0]] : [];
  });
}

function findCommitMatches(commit: Commit): string[] {
  const identityHaystack = [
    commit.commit.author.name,
    commit.commit.author.email,
    commit.commit.committer.name,
    commit.commit.committer.email,
    commit.commit.message,
  ].join(' ');

  return [
    ...matchPatterns(identityHaystack, IDENTITY_PATTERNS),
    ...matchPatterns(commit.commit.message, SIGNATURE_PATTERNS),
  ];
}

async function fetchPrCommits(
  repo: string,
  prNumber: string,
  token: string,
): Promise<Commit[]> {
  return githubGetPaginated<Commit>(
    `https://api.github.com/repos/${repo}/pulls/${prNumber}/commits`,
    token,
  );
}

async function fetchProseSources(
  repo: string,
  prNumber: string,
  token: string,
): Promise<ProseSource[]> {
  const base = `https://api.github.com/repos/${repo}`;
  const sources: ProseSource[] = [];

  const pullRequest = await githubGet<{
    body: string | null;
    html_url: string;
  }>(`${base}/pulls/${prNumber}`, token);
  sources.push({
    kind: 'PR description',
    ref: pullRequest.html_url,
    body: pullRequest.body ?? '',
  });

  const conversationComments = await githubGetPaginated<{
    body: string | null;
    html_url: string;
  }>(`${base}/issues/${prNumber}/comments`, token);
  for (const comment of conversationComments) {
    sources.push({
      kind: 'Conversation comment',
      ref: comment.html_url,
      body: comment.body ?? '',
    });
  }

  const reviewComments = await githubGetPaginated<{
    body: string | null;
    html_url: string;
  }>(`${base}/pulls/${prNumber}/comments`, token);
  for (const comment of reviewComments) {
    sources.push({
      kind: 'Inline review comment',
      ref: comment.html_url,
      body: comment.body ?? '',
    });
  }

  const reviews = await githubGetPaginated<{
    body: string | null;
    html_url: string;
  }>(`${base}/pulls/${prNumber}/reviews`, token);
  for (const review of reviews) {
    sources.push({
      kind: 'Review summary',
      ref: review.html_url,
      body: review.body ?? '',
    });
  }

  return sources;
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;

  if (!token || !repo || !prNumber) {
    console.error(
      'Error: GITHUB_TOKEN, GITHUB_REPOSITORY and PR_NUMBER are required',
    );
    process.exit(1);
  }

  const [commits, proseSources] = await Promise.all([
    fetchPrCommits(repo, prNumber, token),
    fetchProseSources(repo, prNumber, token),
  ]);

  let violations = 0;

  for (const commit of commits) {
    const matches = findCommitMatches(commit);

    if (matches.length > 0) {
      console.error(
        `::error::Commit ${commit.sha} contains a blocked bot attribution or signature (matched: ${matches.join(', ')})`,
      );
      violations += 1;
    }
  }

  for (const source of proseSources) {
    const matches = matchPatterns(source.body, SIGNATURE_PATTERNS);

    if (matches.length > 0) {
      console.error(
        `::error::${source.kind} contains a bot signature (matched: ${matches.join(', ')}) — ${source.ref}`,
      );
      violations += 1;
    }
  }

  if (violations > 0) {
    console.error(
      `\nFound ${violations} item(s) attributed to blocked bot contributors.`,
    );
    console.error(
      'For commits: rewrite the author/committer and strip Co-Authored-By trailers, then force-push:',
    );
    console.error(
      "  git rebase -i --exec 'git commit --amend --reset-author --no-edit' origin/main",
    );
    console.error(
      'For the PR description, comments or reviews: remove the auto-generated attribution footer.',
    );
    process.exit(1);
  }

  console.log('No blocked contributors found in PR commits, description, comments or reviews.');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

// Fails a PR when any commit is attributed to a known bot (author, committer,
// or Co-Authored-By trailer). Patterns match bot identities, not human names.
// Usage: GITHUB_TOKEN=xxx GITHUB_REPOSITORY=owner/repo PR_NUMBER=123 npx nx run twenty-server:ts-node-no-deps-transpile-only -- ./scripts/check-blocked-contributors.ts

const BLOCKED_PATTERNS = [
  /noreply@anthropic\.com/i,
  /@anthropic\.com/i,
  /cursoragent@cursor\.com/i,
  /copilot-swe-agent\[bot\]/i,
];

type Commit = {
  sha: string;
  commit: {
    message: string;
    author: { name: string; email: string };
    committer: { name: string; email: string };
  };
};

async function fetchPrCommits(
  repo: string,
  prNumber: string,
  token: string,
): Promise<Commit[]> {
  const commits: Commit[] = [];
  let page = 1;

  for (;;) {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}/commits?per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API ${response.status}: ${await response.text()}`,
      );
    }

    const batch = (await response.json()) as Commit[];
    commits.push(...batch);

    if (batch.length < 100) {
      return commits;
    }

    page += 1;
  }
}

function findMatches(commit: Commit): string[] {
  const haystack = [
    commit.commit.author.name,
    commit.commit.author.email,
    commit.commit.committer.name,
    commit.commit.committer.email,
    commit.commit.message,
  ].join(' ');

  return BLOCKED_PATTERNS.flatMap((pattern) => {
    const match = haystack.match(pattern);
    return match ? [match[0]] : [];
  });
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;

  if (!token || !repo || !prNumber) {
    console.error('Error: GITHUB_TOKEN, GITHUB_REPOSITORY and PR_NUMBER are required');
    process.exit(1);
  }

  const commits = await fetchPrCommits(repo, prNumber, token);
  let violations = 0;

  for (const commit of commits) {
    const matches = findMatches(commit);

    if (matches.length > 0) {
      console.error(
        `::error::Commit ${commit.sha} is attributed to a blocked contributor (matched: ${matches.join(', ')})`,
      );
      violations += 1;
    }
  }

  if (violations > 0) {
    console.error(`\nFound ${violations} commit(s) attributed to blocked bot contributors.`);
    console.error("Rewrite the author/committer and strip Co-Authored-By trailers, then force-push:");
    console.error("  git rebase -i --exec 'git commit --amend --reset-author --no-edit' origin/main");
    process.exit(1);
  }

  console.log('No blocked contributors found in PR commits.');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

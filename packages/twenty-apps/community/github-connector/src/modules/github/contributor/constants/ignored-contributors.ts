/**
 * GitHub logins of bots / automation accounts that should be excluded from
 * any contributor leaderboard or stats roll-up.
 *
 * Matched case-insensitively against `engineer.ghLogin`.
 */
export const IGNORED_GITHUB_HANDLES: readonly string[] = [
  'cubic-dev-ai',
  'greptile-apps',
  'sentry',
  'sentry-io',
  'copilot-pull-request-reviewer',
  'copilot-swe-agent',
  'github-actions',
  'github-code-quality',
  'github-advanced-security',
  'chatgpt-codex-connector',
  'claude',
  'codecov',
  'codecov-commenter',
  'codecov-io',
  'dependabot',
  'renovate',
  'renovate-bot',
  'snyk-bot',
  'imgbot',
  'allcontributors',
  'allcontributors-bot',
  'pre-commit-ci',
  'mergify',
  'mergify-bot',
  'netlify',
  'netlify-bot',
  'vercel',
  'vercel-bot',
  'changeset-bot',
  'codesandbox-ci',
  'cla-bot',
  'github-pages-bot',
  'cursor',
  'gitstart-app',
] as const;

const IGNORED_HANDLES_LOWERCASE = new Set(
  IGNORED_GITHUB_HANDLES.map((h) => h.toLowerCase()),
);

export const isIgnoredGithubHandle = (
  ghLogin: string | null | undefined,
): boolean => {
  if (!ghLogin) return false;
  return IGNORED_HANDLES_LOWERCASE.has(ghLogin.toLowerCase());
};

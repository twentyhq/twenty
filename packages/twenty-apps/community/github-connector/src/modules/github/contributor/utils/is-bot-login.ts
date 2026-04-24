const BOT_LOGIN_SUFFIX = '[bot]';

const KNOWN_BOT_LOGINS = new Set<string>([
  'github-actions',
  'dependabot',
  'dependabot-preview',
  'renovate',
  'renovate-bot',
  'cubic-dev-ai',
  'greptile-apps',
  'sentry',
  'sentry-io',
  'codecov',
  'codecov-commenter',
  'snyk-bot',
  'mergify',
  'allcontributors',
  'imgbot',
  'pre-commit-ci',
  'semantic-release-bot',
  'stale',
  'web-flow',
]);

export function isBotLogin(login: string | null | undefined): boolean {
  if (!login) return false;
  const lower = login.toLowerCase();
  if (lower.endsWith(BOT_LOGIN_SUFFIX)) return true;
  return KNOWN_BOT_LOGINS.has(lower);
}

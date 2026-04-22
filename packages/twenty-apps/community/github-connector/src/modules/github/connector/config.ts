/**
 * Reads `GITHUB_REPOS` (comma-separated `owner/repo` list) at call time so the
 * value can be reconfigured via the application variables UI without a redeploy.
 */
export function getGithubRepos(): string[] {
  const raw = process.env.GITHUB_REPOS ?? '';
  return raw
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r.includes('/'));
}

export function getGithubProjectNumbers(): number[] {
  const raw = process.env.GITHUB_PROJECT_NUMBERS ?? '';
  return raw
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Owner of the first configured repo, or empty string when none configured. */
export function getDefaultGithubOrg(): string {
  const first = getGithubRepos()[0];
  if (!first) return '';
  return first.split('/')[0] ?? '';
}

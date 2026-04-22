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

export type GithubProject = { owner: string; number: number };

/**
 * Parses a single project entry. Accepts:
 *   - `owner/number`                                     (e.g. `twentyhq/24`)
 *   - `https://github.com/orgs/owner/projects/number`
 *   - `https://github.com/users/owner/projects/number`
 * Returns null when the entry can't be parsed.
 */
export function parseGithubProject(entry: string): GithubProject | null {
  const trimmed = entry.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /github\.com\/(?:orgs|users)\/([^/]+)\/projects\/(\d+)/i,
  );
  if (urlMatch) {
    const owner = urlMatch[1];
    const number = Number.parseInt(urlMatch[2], 10);
    if (owner && Number.isFinite(number) && number > 0) {
      return { owner, number };
    }
  }

  const shortMatch = trimmed.match(/^([^/\s]+)\/(\d+)$/);
  if (shortMatch) {
    const owner = shortMatch[1];
    const number = Number.parseInt(shortMatch[2], 10);
    if (owner && Number.isFinite(number) && number > 0) {
      return { owner, number };
    }
  }

  return null;
}

/**
 * Reads `GITHUB_PROJECTS` (comma-separated `owner/number` list) at call time.
 */
export function getGithubProjects(): GithubProject[] {
  const raw = process.env.GITHUB_PROJECTS ?? '';
  return raw
    .split(',')
    .map(parseGithubProject)
    .filter((p): p is GithubProject => p !== null);
}

export type GithubRepo = { owner: string; repo: string };

export function parseGithubRepo(entry: string): GithubRepo | null {
  const trimmed = entry.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export function getGithubRepos(): string[] {
  const raw = process.env.GITHUB_REPOS ?? '';
  return raw
    .split(',')
    .map(parseGithubRepo)
    .filter((r): r is GithubRepo => r !== null)
    .map((r) => `${r.owner}/${r.repo}`);
}

export type GithubProject = { owner: string; number: number };

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

export function getGithubProjects(): GithubProject[] {
  const raw = process.env.GITHUB_PROJECTS ?? '';
  return raw
    .split(',')
    .map(parseGithubProject)
    .filter((p): p is GithubProject => p !== null);
}

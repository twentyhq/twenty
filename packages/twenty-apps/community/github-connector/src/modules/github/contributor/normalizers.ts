export type GhUser = { login: string; id?: number; databaseId?: number };

export type ContributorCanonical = {
  ghLogin: string;
  name: string;
  githubId: number;
};

export function contributorFromGhUser(user: GhUser): ContributorCanonical {
  return {
    ghLogin: user.login,
    name: user.login,
    githubId: user.id ?? user.databaseId ?? 0,
  };
}

export function dedupeContributors(
  users: Array<GhUser | null | undefined>,
): ContributorCanonical[] {
  const seen = new Map<string, ContributorCanonical>();
  for (const u of users) {
    if (!u || !u.login) continue;
    if (!seen.has(u.login)) seen.set(u.login, contributorFromGhUser(u));
  }
  return [...seen.values()];
}

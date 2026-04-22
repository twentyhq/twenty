export type GhUser = { login: string; id?: number; databaseId?: number };

export type EngineerCanonical = {
  ghLogin: string;
  name: string;
  githubId: number;
};

export function engineerFromGhUser(user: GhUser): EngineerCanonical {
  return {
    ghLogin: user.login,
    name: user.login,
    githubId: user.id ?? user.databaseId ?? 0,
  };
}

export function dedupeEngineers(
  users: Array<GhUser | null | undefined>,
): EngineerCanonical[] {
  const seen = new Map<string, EngineerCanonical>();
  for (const u of users) {
    if (!u || !u.login) continue;
    if (!seen.has(u.login)) seen.set(u.login, engineerFromGhUser(u));
  }
  return [...seen.values()];
}

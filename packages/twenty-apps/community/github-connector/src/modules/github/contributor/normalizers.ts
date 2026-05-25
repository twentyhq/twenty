import { type LinksFieldValue, toLinksField } from 'src/modules/shared/types';

export type GhUser = {
  login: string;
  id?: number;
  databaseId?: number;
  avatarUrl?: string | null;
  avatar_url?: string | null;
};

export type ContributorCanonical = {
  ghLogin: string;
  name: string;
  githubId: number;
  avatarUrl: LinksFieldValue | null;
};

export function contributorFromGhUser(user: GhUser): ContributorCanonical {
  const avatarUrl = user.avatarUrl ?? user.avatar_url ?? null;
  return {
    ghLogin: user.login,
    name: user.login,
    githubId: user.id ?? user.databaseId ?? 0,
    avatarUrl: avatarUrl ? toLinksField(avatarUrl, user.login) : null,
  };
}

export function dedupeContributors(
  users: Array<GhUser | null | undefined>,
): ContributorCanonical[] {
  const seen = new Map<string, ContributorCanonical>();
  for (const u of users) {
    if (!u || !u.login) continue;
    const existing = seen.get(u.login);
    if (!existing) {
      seen.set(u.login, contributorFromGhUser(u));
      continue;
    }
    if (!existing.avatarUrl) {
      const avatarUrl = u.avatarUrl ?? u.avatar_url ?? null;
      if (avatarUrl) {
        existing.avatarUrl = toLinksField(avatarUrl, u.login);
      }
    }
  }
  return [...seen.values()];
}

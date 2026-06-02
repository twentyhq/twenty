import type { LinksFieldValue } from 'src/modules/shared/types';

export type ContributorRow = {
  id: string;
  ghLogin?: string | null;
  name?: string | null;
  githubId?: number | null;
  avatarUrl?: LinksFieldValue | null;
  contributions?: number | null;
};

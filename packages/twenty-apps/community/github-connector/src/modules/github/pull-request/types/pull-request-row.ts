import type { LinksFieldValue } from 'src/modules/shared/types';

export type PullRequestRow = {
  id: string;
  name?: string | null;
  githubNumber?: number | null;
  uniqueIdentifier?: string | null;
  url?: LinksFieldValue | null;
  state?: string | null;
  mergedAt?: string | null;
  closedAt?: string | null;
  githubCreatedAt?: string | null;
  authorId?: string | null;
  mergerId?: string | null;
};

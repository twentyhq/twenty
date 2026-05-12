import type { LinksFieldValue } from 'src/modules/shared/types';

export type IssueRow = {
  id: string;
  title?: string | null;
  githubNumber?: number | null;
  uniqueIdentifier?: string | null;
  githubUrl?: LinksFieldValue | null;
  state?: string | null;
  labels?: string[] | null;
  githubCreatedAt?: string | null;
  closedAt?: string | null;
  repo?: string | null;
  authorId?: string | null;
};

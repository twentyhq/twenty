import type { LinksFieldValue } from 'src/modules/shared/types';

export type EngineerRow = {
  id: string;
  ghLogin?: string | null;
  name?: string | null;
  githubId?: number | null;
  isCoreTeam?: boolean | null;
  avatarUrl?: LinksFieldValue | null;
  contributions?: number | null;
};

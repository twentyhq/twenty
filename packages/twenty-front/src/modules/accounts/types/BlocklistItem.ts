import { BlocklistContactLevel } from '@/settings/accounts/types/BlocklistContactLevel';

export type BlocklistItem = {
  id: string;
  handle: string;
  levels?: BlocklistContactLevel[];
  workspaceMemberId: string;
  createdAt: string;
  __typename: 'BlocklistItem';
};

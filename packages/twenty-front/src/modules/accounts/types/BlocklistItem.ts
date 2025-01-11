import { BlocklistItemScope } from '@/settings/accounts/types/BlocklistItemScope';

export type BlocklistItem = {
  id: string;
  handle: string;
  scopes?: BlocklistItemScope[];
  workspaceMemberId: string;
  createdAt: string;
  __typename: 'BlocklistItem';
};

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { createContext } from 'react';
import { NullableString } from '~/types/NullableString';

export type BlocklistContextType = {
  blocklist: BlocklistItem[];
  savedContactIdBeingUpdated: NullableString;
  setSavedContactIdBeingUpdated: (id: NullableString) => void;
  handleBlockedEmailRemove: (id: string) => void;
  updateBlockedEmail: (contact: BlocklistItem) => void;
  addNewBlockedEmail: (contact: BlocklistItem) => void;
};

export const BlocklistContext = createContext<BlocklistContextType>(
  {} as BlocklistContextType,
);

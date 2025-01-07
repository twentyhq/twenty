import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { createContext } from 'react';
import { OptionalString } from '~/types/OptionalString';

export type BlocklistContextType = {
  blocklist: BlocklistItem[];
  savedContactIdBeingUpdated: OptionalString;
  setSavedContactIdBeingUpdated: (id: OptionalString) => void;
  handleBlockedEmailRemove: (id: string) => void;
  updateBlockedEmail: (contact: BlocklistItem) => void;
  addNewBlockedEmail: (contact: BlocklistItem) => void;
};

export const BlocklistContext = createContext<BlocklistContextType>(
  {} as BlocklistContextType,
);

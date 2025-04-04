import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createContext } from 'react';

type ActionMenuContextType = {
  objectMetadataItem: ObjectMetadataItem | null;
  isInRightDrawer: boolean;
  onActionStartedCallback?: (action: { key: string }) => Promise<void> | void;
  onActionExecutedCallback?: (action: { key: string }) => Promise<void> | void;
  displayType: 'button' | 'listItem' | 'dropdownItem';
};

export const ActionMenuContext = createContext<ActionMenuContextType>({
  objectMetadataItem: null,
  isInRightDrawer: false,
  displayType: 'button',
  onActionStartedCallback: () => {},
  onActionExecutedCallback: () => {},
});

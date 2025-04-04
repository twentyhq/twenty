import { createContext } from 'react';

type ActionMenuContextType = {
  isInRightDrawer: boolean;
  onActionStartedCallback?: (action: { key: string }) => Promise<void> | void;
  onActionExecutedCallback?: (action: { key: string }) => Promise<void> | void;
  displayType: 'button' | 'listItem' | 'dropdownItem';
};

export const ActionMenuContext = createContext<ActionMenuContextType>({
  isInRightDrawer: false,
  displayType: 'button',
  onActionStartedCallback: () => {},
  onActionExecutedCallback: () => {},
});

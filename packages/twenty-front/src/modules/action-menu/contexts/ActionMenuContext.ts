import { createContext } from 'react';

type ActionMenuContextType = {
  isInRightDrawer: boolean;
  onActionStartedCallback?: (action: { key: string }) => Promise<void> | void;
  onActionExecutedCallback?: (action: { key: string }) => Promise<void> | void;
  display: 'button' | 'listItem' | 'dropdownItem';
};

export const ActionMenuContext = createContext<ActionMenuContextType>({
  isInRightDrawer: false,
  display: 'button',
  onActionStartedCallback: () => {},
  onActionExecutedCallback: () => {},
});

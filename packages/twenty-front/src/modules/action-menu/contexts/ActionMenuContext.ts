import { createContext } from 'react';

type ActionMenuContextType = {
  isInRightDrawer: boolean;
  onActionStartedCallback?: (action: { key: string }) => void;
  onActionExecutedCallback?: (action: { key: string }) => void;
};

export const ActionMenuContext = createContext<ActionMenuContextType>({
  isInRightDrawer: false,
  onActionStartedCallback: () => {},
  onActionExecutedCallback: () => {},
});

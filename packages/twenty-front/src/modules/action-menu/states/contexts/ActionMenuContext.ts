import { createContext } from 'react';

export type ActionMenuContextType = {
  isInRightDrawer: boolean;
  onActionExecutedCallback: () => void;
};

export const ActionMenuContext = createContext<ActionMenuContextType>({
  isInRightDrawer: false,
  onActionExecutedCallback: () => {},
});

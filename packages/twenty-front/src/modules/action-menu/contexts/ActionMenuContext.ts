import { createContext } from 'react';

type ActionMenuContextType = {
  isInRightDrawer: boolean;
  onActionExecutedCallback: () => void;
};

export const ActionMenuContext = createContext<ActionMenuContextType>({
  isInRightDrawer: false,
  onActionExecutedCallback: () => {},
});

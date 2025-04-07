import { createContext } from 'react';

type ActionMenuContextType = {
  isInRightDrawer: boolean;
  displayType: 'button' | 'listItem' | 'dropdownItem';
  actionMenuType:
    | 'command-menu'
    | 'show-page-action-menu'
    | 'index-page-action-menu'
    | 'index-page-action-menu-dropdown'
    | 'command-menu-show-page-action-menu-dropdown';
};

export const ActionMenuContext = createContext<ActionMenuContextType>({
  isInRightDrawer: false,
  actionMenuType: 'command-menu',
  displayType: 'button',
});

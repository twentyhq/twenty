import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

export const useCommandMenu = () => {
  const {
    openSidePanelMenu,
    closeSidePanelMenu,
    navigateSidePanelMenu,
    toggleSidePanelMenu,
  } = useSidePanelMenu();

  return {
    openCommandMenu: openSidePanelMenu,
    closeCommandMenu: closeSidePanelMenu,
    navigateCommandMenu: navigateSidePanelMenu,
    toggleCommandMenu: toggleSidePanelMenu,
  };
};

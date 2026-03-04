import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { SidePanelPages } from 'twenty-shared/types';
import type { IconComponent } from 'twenty-ui/display';

export const useOpenNavigationMenuItemInCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateSidePanel();

  const openNavigationMenuItemInCommandMenu = ({
    pageTitle,
    pageIcon,
    focusTitleInput = false,
  }: {
    pageTitle: string;
    pageIcon: IconComponent;
    focusTitleInput?: boolean;
  }) => {
    navigateCommandMenu({
      page: SidePanelPages.NavigationMenuItemEdit,
      pageTitle,
      pageIcon,
      resetNavigationStack: true,
      focusTitleInput,
    });
  };

  return {
    openNavigationMenuItemInCommandMenu,
  };
};

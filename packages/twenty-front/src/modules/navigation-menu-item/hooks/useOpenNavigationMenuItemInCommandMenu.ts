import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import type { IconComponent } from 'twenty-ui/display';

export const useOpenNavigationMenuItemInCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

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
      page: CommandMenuPages.NavigationMenuItemEdit,
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

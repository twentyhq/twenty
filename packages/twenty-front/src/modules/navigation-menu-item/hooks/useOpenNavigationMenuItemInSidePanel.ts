import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { SidePanelPages } from 'twenty-shared/types';
import type { IconComponent } from 'twenty-ui/display';

export const useOpenNavigationMenuItemInSidePanel = () => {
  const { navigateSidePanel } = useNavigateSidePanel();

  const openNavigationMenuItemInSidePanel = ({
    pageTitle,
    pageIcon,
    focusTitleInput = false,
  }: {
    pageTitle: string;
    pageIcon: IconComponent;
    focusTitleInput?: boolean;
  }) => {
    navigateSidePanel({
      page: SidePanelPages.NavigationMenuItemEdit,
      pageTitle,
      pageIcon,
      resetNavigationStack: true,
      focusTitleInput,
    });
  };

  return {
    openNavigationMenuItemInSidePanel,
  };
};

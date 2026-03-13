import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import type { IconComponent } from 'twenty-ui/display';

export const useOpenNavigationMenuItemInSidePanel = () => {
  const { navigateSidePanel } = useNavigateSidePanel();
  const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
    selectedNavigationMenuItemInEditModeState,
  );

  const openNavigationMenuItemInSidePanel = ({
    itemId,
    pageTitle,
    pageIcon,
    focusTitleInput = false,
  }: {
    itemId?: string;
    pageTitle: string;
    pageIcon: IconComponent;
    focusTitleInput?: boolean;
  }) => {
    if (isDefined(itemId)) {
      setSelectedNavigationMenuItemInEditMode(itemId);
    }
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

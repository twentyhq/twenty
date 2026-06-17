import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import type { IconComponent } from 'twenty-ui/display';

export const useOpenNavigationMenuItemInSidePanel = () => {
  const { navigateSidePanel } = useNavigateSidePanel();
  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const setPendingInsertionNavigationMenuItem = useSetAtomState(
    pendingInsertionNavigationMenuItemState,
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
      setSelectedNavigationMenuItemIdInEditMode(itemId);
    }
    setPendingInsertionNavigationMenuItem(null);
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

import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPencil } from 'twenty-ui/display';

import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useEnterLayoutCustomizationMode = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { enqueueWarningSnackBar } = useSnackBar();

  const enterLayoutCustomizationMode = useCallback(() => {
    const isLayoutCustomizationModeAlreadyEnabled = store.get(
      isLayoutCustomizationModeEnabledState.atom,
    );

    if (isLayoutCustomizationModeAlreadyEnabled) {
      return;
    }

    const dashboardPageLayoutIdInEditMode = store.get(
      currentPageLayoutIdState.atom,
    );

    if (isDefined(dashboardPageLayoutIdInEditMode)) {
      const isDashboardInEditMode = store.get(
        isDashboardInEditModeComponentState.atomFamily({
          instanceId: dashboardPageLayoutIdInEditMode,
        }),
      );

      if (isDashboardInEditMode) {
        enqueueWarningSnackBar({
          message: t`Save or cancel dashboard changes before editing the layout.`,
        });

        return;
      }
    }

    const prefetchNavigationMenuItems = store.get(
      navigationMenuItemsSelector.atom,
    );
    const workspaceNavigationMenuItems = filterWorkspaceNavigationMenuItems(
      prefetchNavigationMenuItems,
    );
    store.set(navigationMenuItemsDraftState.atom, workspaceNavigationMenuItems);

    const persistedCommandMenuItems = store.get(commandMenuItemsSelector.atom);
    store.set(commandMenuItemsDraftState.atom, persistedCommandMenuItems);

    store.set(activeCustomizationPageLayoutIdsState.atom, []);

    store.set(isLayoutCustomizationModeEnabledState.atom, true);

    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);
    const currentSidePanelPage = store.get(sidePanelPageState.atom);

    if (
      isSidePanelOpened &&
      currentSidePanelPage === SidePanelPages.CommandMenuDisplay
    ) {
      navigateSidePanel({
        page: SidePanelPages.CommandMenuEdit,
        pageTitle: t`Edit actions`,
        pageIcon: IconPencil,
        resetNavigationStack: true,
      });
    }
  }, [enqueueWarningSnackBar, navigateSidePanel, store]);

  return { enterLayoutCustomizationMode };
};

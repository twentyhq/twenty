import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPencil } from 'twenty-ui/display';

import { commandMenuItemEditRecordSelectionPreviewModeState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditRecordSelectionPreviewModeState';
import { commandMenuItemsDraftState } from '@/command-menu-item/server-items/edit/states/commandMenuItemsDraftState';
import { commandMenuItemsSelector } from '@/command-menu-item/server-items/common/states/commandMenuItemsSelector';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndCommandMenuStates';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useEnterLayoutCustomizationMode = () => {
  const store = useStore();
  const { copyContextStoreStates } = useCopyContextStoreStates();
  const { navigateSidePanel } = useNavigateSidePanel();
  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
  );

  const enterLayoutCustomizationMode = useCallback(() => {
    const isLayoutCustomizationModeAlreadyEnabled = store.get(
      isLayoutCustomizationModeEnabledState.atom,
    );

    if (isLayoutCustomizationModeAlreadyEnabled) {
      return;
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
      isCommandMenuItemEnabled &&
      isSidePanelOpened &&
      currentSidePanelPage === SidePanelPages.CommandMenuDisplay
    ) {
      copyContextStoreStates({
        instanceIdToCopyFrom: MAIN_CONTEXT_STORE_INSTANCE_ID,
        instanceIdToCopyTo: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      });

      store.set(
        commandMenuItemEditRecordSelectionPreviewModeState.atomFamily({
          instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
        }),
        'selection',
      );

      navigateSidePanel({
        page: SidePanelPages.CommandMenuEdit,
        pageTitle: t`Edit actions`,
        pageIcon: IconPencil,
        resetNavigationStack: true,
      });
    }
  }, [
    copyContextStoreStates,
    isCommandMenuItemEnabled,
    navigateSidePanel,
    store,
  ]);

  return { enterLayoutCustomizationMode };
};

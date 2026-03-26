import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPencil } from 'twenty-ui/display';

import { commandMenuItemEditNumberOfSelectedRecordsState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditNumberOfSelectedRecordsState';
import { commandMenuItemEditObjectMetadataItemIdState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditObjectMetadataItemIdState';
import { commandMenuItemEditTargetedRecordsRuleState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditTargetedRecordsRuleState';
import { commandMenuItemsDraftState } from '@/command-menu-item/server-items/edit/states/commandMenuItemsDraftState';
import { commandMenuItemsSelector } from '@/command-menu-item/server-items/common/states/commandMenuItemsSelector';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
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
  const { navigateSidePanel } = useNavigateSidePanel();
  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
  );

  const snapshotEditionStatesFromMainContext = useCallback(() => {
    store.set(
      commandMenuItemEditObjectMetadataItemIdState.atomFamily({
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      }),
      store.get(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ) ?? null,
    );

    store.set(
      commandMenuItemEditTargetedRecordsRuleState.atomFamily({
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      }),
      store.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    );

    store.set(
      commandMenuItemEditNumberOfSelectedRecordsState.atomFamily({
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      }),
      store.get(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    );
  }, [store]);

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
      snapshotEditionStatesFromMainContext();

      navigateSidePanel({
        page: SidePanelPages.CommandMenuEdit,
        pageTitle: t`Edit actions`,
        pageIcon: IconPencil,
        resetNavigationStack: true,
      });
    }
  }, [
    isCommandMenuItemEnabled,
    navigateSidePanel,
    snapshotEditionStatesFromMainContext,
    store,
  ]);

  return { enterLayoutCustomizationMode };
};

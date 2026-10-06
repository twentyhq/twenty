import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemEditButton } from '@/command-menu-item/edit/components/CommandMenuItemEditButton';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { commandMenuTargetObjectPermissionsSelector } from '@/command-menu-item/states/commandMenuTargetObjectPermissionsSelector';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectMetadataId';
import { doesCommandMenuItemMatchPageLayoutId } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageLayoutId';
import { resolveCommandMenuItemPinning } from '@/command-menu-item/utils/resolveCommandMenuItemPinning';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceFeatureFlagsMap } from '@/workspace/utils/getWorkspaceFeatureFlagsMap';
import { useMemo } from 'react';
import {
  ContextStorePageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const StandalonePageCommandMenu = () => {
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const currentUser = useAtomStateValue(currentUserState);
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { targetObjectReadPermissions, targetObjectWritePermissions } =
    useAtomStateValue(commandMenuTargetObjectPermissionsSelector);

  const commandMenuContextApi = useMemo<CommandMenuContextApi>(() => {
    const featureFlags = getWorkspaceFeatureFlagsMap(
      currentWorkspace?.featureFlags,
    );

    return {
      pageType: ContextStorePageType.Standalone,
      isInSidePanel: false,
      isDashboardPageLayoutInEditMode: false,
      isLayoutCustomizationModeEnabled,
      favoriteRecordIds: [],
      isSelectAll: false,
      hasAnySoftDeleteFilterOnView: false,
      numberOfSelectedRecords: 0,
      objectPermissions: EMPTY_COMMAND_MENU_CONTEXT_API.objectPermissions,
      selectedRecords: [],
      featureFlags,
      permissionFlags: permissionFlagMap,
      targetObjectReadPermissions,
      targetObjectWritePermissions,
      canImpersonate: currentUser?.canImpersonate === true,
      canAccessFullAdminPanel: currentUser?.canAccessFullAdminPanel === true,
      objectMetadataItem: {},
      objectMetadataLabel: '',
    };
  }, [
    currentWorkspace?.featureFlags,
    permissionFlagMap,
    currentUser?.canImpersonate,
    currentUser?.canAccessFullAdminPanel,
    isLayoutCustomizationModeEnabled,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
  ]);

  const filteredCommandMenuItems = useMemo(() => {
    return commandMenuItems
      .filter(
        (item) =>
          item.engineComponentKey !==
            EngineComponentKey.EDIT_RECORD_PAGE_LAYOUT ||
          isLayoutCustomizationAllowedOnCurrentPage,
      )
      .filter(doesCommandMenuItemMatchObjectMetadataId(undefined))
      .filter(
        (item) =>
          item.availabilityType !==
            CommandMenuItemAvailabilityType.RECORD_SELECTION &&
          item.availabilityType !==
            CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
      )
      .filter(doesCommandMenuItemMatchPageLayoutId(currentPageLayoutId))
      .filter((item) =>
        evaluateConditionalAvailabilityExpression(
          item.conditionalAvailabilityExpression,
          commandMenuContextApi,
        ),
      )
      .map((item) => resolveCommandMenuItemPinning(item, commandMenuContextApi))
      .sort(
        (firstItem, secondItem) => firstItem.position - secondItem.position,
      );
  }, [
    commandMenuItems,
    commandMenuContextApi,
    currentPageLayoutId,
    isLayoutCustomizationAllowedOnCurrentPage,
  ]);

  return (
    <CommandMenuContext.Provider
      value={{
        displayType: 'button',
        containerType: CommandMenuItemContainerType.StandalonePageHeader,
        commandMenuItems: filteredCommandMenuItems,
        commandMenuContextApi,
        isInPreviewMode: false,
      }}
    >
      <PinnedCommandMenuItemButtons />
      <CommandMenuItemEditButton />
    </CommandMenuContext.Provider>
  );
};

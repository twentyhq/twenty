import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemEditButton } from '@/command-menu-item/edit/components/CommandMenuItemEditButton';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectMetadataId';
import { doesCommandMenuItemMatchPageLayoutId } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageLayoutId';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useMemo } from 'react';
import {
  ContextStorePageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const StandalonePageCommandMenu = () => {
  const store = useStore();
  const isMobile = useIsMobile();
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);
  const { objectMetadataItems } = useObjectMetadataItems();

  const commandMenuContextApi = useMemo<CommandMenuContextApi>(() => {
    const featureFlags: Record<string, boolean> = {};

    for (const flag of currentWorkspace?.featureFlags ?? []) {
      featureFlags[flag.key] = flag.value === true;
    }

    const targetObjectReadPermissions: Record<string, boolean> = {};
    const targetObjectWritePermissions: Record<string, boolean> = {};

    for (const metadataItem of objectMetadataItems) {
      const permissions = store.get(
        objectPermissionsFamilySelector.selectorFamily({
          objectNameSingular: metadataItem.nameSingular,
        }),
      );
      targetObjectReadPermissions[metadataItem.nameSingular] =
        permissions.canRead;
      targetObjectWritePermissions[metadataItem.nameSingular] =
        permissions.canUpdate;
    }

    return {
      pageType: ContextStorePageType.Standalone,
      isInSidePanel: false,
      isPageInEditMode: false,
      favoriteRecordIds: [],
      isSelectAll: false,
      hasAnySoftDeleteFilterOnView: false,
      numberOfSelectedRecords: 0,
      objectPermissions: {
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        objectMetadataId: '',
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      },
      selectedRecords: [],
      featureFlags,
      targetObjectReadPermissions,
      targetObjectWritePermissions,
      objectMetadataItem: {},
      objectMetadataLabel: '',
    };
  }, [currentWorkspace?.featureFlags, objectMetadataItems, store]);

  const filteredCommandMenuItems = useMemo(() => {
    return commandMenuItems
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
      .sort(
        (firstItem, secondItem) => firstItem.position - secondItem.position,
      );
  }, [commandMenuItems, commandMenuContextApi, currentPageLayoutId]);

  return (
    <CommandMenuContext.Provider
      value={{
        displayType: 'button',
        containerType: 'standalone-page-header',
        commandMenuItems: filteredCommandMenuItems,
        commandMenuContextApi,
      }}
    >
      {!isMobile && <PinnedCommandMenuItemButtons />}
      <CommandMenuItemEditButton />
    </CommandMenuContext.Provider>
  );
};

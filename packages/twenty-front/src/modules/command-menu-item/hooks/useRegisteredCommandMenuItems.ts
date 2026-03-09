import { useRecordAgnosticCommands } from '@/command-menu-item/record-agnostic/hooks/useRecordAgnosticCommands';
import { useRelatedRecordCommands } from '@/command-menu-item/record-agnostic/hooks/useRelatedRecordCommands';
import { CommandMenuItemViewType } from 'twenty-shared/types';
import { type ShouldBeRegisteredFunctionParams } from '@/command-menu-item/types/ShouldBeRegisteredFunctionParams';
import { getCommandMenuItemConfig } from '@/command-menu-item/utils/getCommandMenuItemConfig';
import { getCommandMenuItemViewType } from '@/command-menu-item/utils/getCommandMenuItemViewType';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRegisteredCommandMenuItems = (
  shouldBeRegisteredParams: ShouldBeRegisteredFunctionParams,
) => {
  const { objectMetadataItem } = shouldBeRegisteredParams;

  const { getIcon } = useIcons();

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentViewType = useAtomComponentStateValue(
    contextStoreCurrentViewTypeComponentState,
  );

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const viewType = getCommandMenuItemViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const recordCommandMenuItemsConfig = getCommandMenuItemConfig({
    objectMetadataItem,
  });

  const relatedRecordCommandMenuItemsConfig = useRelatedRecordCommands({
    sourceObjectMetadataItem: objectMetadataItem,
    getIcon,
    startPosition: Object.keys(recordCommandMenuItemsConfig).length + 1,
  });

  const recordAgnosticCommandMenuItemsConfig = useRecordAgnosticCommands();

  const commandMenuItemsConfig = {
    ...recordCommandMenuItemsConfig,
    ...relatedRecordCommandMenuItemsConfig,
    ...recordAgnosticCommandMenuItemsConfig,
  };

  const permissionMap = usePermissionFlagMap();

  const commandMenuItemsToRegister = Object.values(
    commandMenuItemsConfig,
  ).filter((commandMenuItem) => {
    if (contextStoreIsPageInEditMode) {
      return (
        isDefined(commandMenuItem.availableOn) &&
        commandMenuItem.availableOn.includes(
          CommandMenuItemViewType.PAGE_EDIT_MODE,
        )
      );
    }

    if (isDefined(viewType)) {
      return (
        commandMenuItem.availableOn?.includes(viewType) ||
        commandMenuItem.availableOn?.includes(CommandMenuItemViewType.GLOBAL)
      );
    }

    return commandMenuItem.availableOn?.includes(
      CommandMenuItemViewType.GLOBAL,
    );
  });

  const commandMenuItems = commandMenuItemsToRegister
    .filter((commandMenuItem) => {
      if (
        isDefined(commandMenuItem.requiredPermissionFlag) &&
        !permissionMap[commandMenuItem.requiredPermissionFlag]
      ) {
        return false;
      }
      return commandMenuItem.shouldBeRegistered(shouldBeRegisteredParams);
    })
    .sort((a, b) => a.position - b.position);

  return commandMenuItems;
};

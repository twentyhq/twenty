import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { isDefined } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

export const mergeGlobalRecordCreationCommandMenuItems = ({
  commandMenuItems,
  globalRecordCreationCommandMenuItems,
  shouldDisplayGlobalRecordCreationCommands,
  contextObjectMetadataId,
}: {
  commandMenuItems: CommandMenuItemDefinition[];
  globalRecordCreationCommandMenuItems: CommandMenuItemDefinition[];
  shouldDisplayGlobalRecordCreationCommands: boolean;
  contextObjectMetadataId?: string;
}): CommandMenuItemDefinition[] => {
  const sortedCommandMenuItems = [...commandMenuItems].sort(
    (firstItem, secondItem) => firstItem.position - secondItem.position,
  );

  if (!shouldDisplayGlobalRecordCreationCommands) {
    return sortedCommandMenuItems;
  }

  const hasCurrentObjectCreationCommand =
    isDefined(contextObjectMetadataId) &&
    globalRecordCreationCommandMenuItems.some(
      (item) => item.creationTargetObjectMetadataId === contextObjectMetadataId,
    );

  // Workspaces not yet upgraded to 2.58 have no core workflow create item; fall back to the legacy one until then.
  const hasCoreObjectCreationCommand = sortedCommandMenuItems.some(
    (item) =>
      isDefined(item.availabilityCoreObjectName) &&
      item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD,
  );

  const isPinnedContextualCreationCommand = (item: CommandMenuItemDefinition) =>
    !hasCoreObjectCreationCommand &&
    hasCurrentObjectCreationCommand &&
    item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD &&
    item.isPinned;

  const hasPinnedContextualCreationCommand = sortedCommandMenuItems.some(
    isPinnedContextualCreationCommand,
  );

  return [
    ...sortedCommandMenuItems.filter(
      (item) =>
        isPinnedContextualCreationCommand(item) ||
        isDefined(item.availabilityCoreObjectName) ||
        (item.engineComponentKey !== EngineComponentKey.CREATE_NEW_RECORD &&
          item.engineComponentKey !== EngineComponentKey.NAVIGATION),
    ),
    ...globalRecordCreationCommandMenuItems.filter(
      (item) =>
        !(hasPinnedContextualCreationCommand || hasCoreObjectCreationCommand) ||
        item.creationTargetObjectMetadataId !== contextObjectMetadataId,
    ),
    ...sortedCommandMenuItems.filter(
      (item) => item.engineComponentKey === EngineComponentKey.NAVIGATION,
    ),
  ];
};

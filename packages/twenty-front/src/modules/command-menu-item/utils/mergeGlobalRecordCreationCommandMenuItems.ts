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
  contextObjectMetadataId?: unknown;
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
  const pinnedCreationCommands = sortedCommandMenuItems.filter(
    (item) =>
      item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD &&
      item.isPinned &&
      hasCurrentObjectCreationCommand,
  );

  return [
    ...pinnedCreationCommands,
    ...sortedCommandMenuItems.filter(
      (item) =>
        item.engineComponentKey !== EngineComponentKey.CREATE_NEW_RECORD &&
        item.engineComponentKey !== EngineComponentKey.NAVIGATION,
    ),
    ...globalRecordCreationCommandMenuItems.filter(
      (item) =>
        pinnedCreationCommands.length === 0 ||
        item.creationTargetObjectMetadataId !== contextObjectMetadataId,
    ),
    ...sortedCommandMenuItems.filter(
      (item) => item.engineComponentKey === EngineComponentKey.NAVIGATION,
    ),
  ];
};

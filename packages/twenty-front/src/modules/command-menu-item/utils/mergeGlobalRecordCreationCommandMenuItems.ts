import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { isDefined } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const isCreationCommand = (item: CommandMenuItemDefinition) =>
  item.engineComponentKey === EngineComponentKey.CREATE_NEW_RECORD;

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
  // Workspaces not yet upgraded to 2.58 have no core workflow create item; the legacy one stands in until then.
  const hasCoreObjectCreationCommand = commandMenuItems.some(
    (item) =>
      isCreationCommand(item) && isDefined(item.availabilityCoreObjectName),
  );

  const sortedCommandMenuItems = [...commandMenuItems]
    .filter(
      (item) =>
        !hasCoreObjectCreationCommand ||
        !isCreationCommand(item) ||
        isDefined(item.availabilityCoreObjectName) ||
        isDefined(item.availabilityObjectMetadataId),
    )
    .sort((firstItem, secondItem) => firstItem.position - secondItem.position);

  if (!shouldDisplayGlobalRecordCreationCommands) {
    return sortedCommandMenuItems;
  }

  const hasCurrentObjectCreationCommand =
    isDefined(contextObjectMetadataId) &&
    globalRecordCreationCommandMenuItems.some(
      (item) => item.creationTargetObjectMetadataId === contextObjectMetadataId,
    );

  const isPinnedContextualCreationCommand = (item: CommandMenuItemDefinition) =>
    hasCurrentObjectCreationCommand && isCreationCommand(item) && item.isPinned;

  const hasPinnedContextualCreationCommand = sortedCommandMenuItems.some(
    isPinnedContextualCreationCommand,
  );

  return [
    ...sortedCommandMenuItems.filter(
      (item) =>
        isPinnedContextualCreationCommand(item) ||
        isDefined(item.availabilityCoreObjectName) ||
        (!isCreationCommand(item) &&
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

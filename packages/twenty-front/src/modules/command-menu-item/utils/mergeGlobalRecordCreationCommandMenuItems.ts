import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { EngineComponentKey } from '~/generated-metadata/graphql';

export const mergeGlobalRecordCreationCommandMenuItems = ({
  commandMenuItems,
  globalRecordCreationCommandMenuItems,
  shouldDisplayGlobalRecordCreationCommands,
}: {
  commandMenuItems: CommandMenuItemDefinition[];
  globalRecordCreationCommandMenuItems: CommandMenuItemDefinition[];
  shouldDisplayGlobalRecordCreationCommands: boolean;
}): CommandMenuItemDefinition[] => {
  const sortedCommandMenuItems = [...commandMenuItems].sort(
    (firstItem, secondItem) => firstItem.position - secondItem.position,
  );

  if (!shouldDisplayGlobalRecordCreationCommands) {
    return sortedCommandMenuItems;
  }

  return [
    ...sortedCommandMenuItems.filter(
      (item) =>
        item.engineComponentKey !== EngineComponentKey.CREATE_NEW_RECORD &&
        item.engineComponentKey !== EngineComponentKey.NAVIGATION,
    ),
    ...globalRecordCreationCommandMenuItems,
    ...sortedCommandMenuItems.filter(
      (item) => item.engineComponentKey === EngineComponentKey.NAVIGATION,
    ),
  ];
};

import { DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/DefaultRecordCommandMenuItemsConfig';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { type DefaultRecordCommandKeys } from '@/command-menu-item/record/types/DefaultRecordCommandKeys';

export const inheritCommandMenuItemsFromDefaultConfig = ({
  config,
  commandKeys,
  propertiesToOverwrite,
}: {
  config: Record<string, CommandMenuItemConfig>;
  commandKeys: DefaultRecordCommandKeys[];
  propertiesToOverwrite: Partial<
    Record<DefaultRecordCommandKeys, Partial<CommandMenuItemConfig>>
  >;
}): Record<string, CommandMenuItemConfig> => {
  const commandMenuItemsFromDefaultConfig = commandKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[key],
        ...propertiesToOverwrite[key],
      },
    }),
    {} as Record<string, CommandMenuItemConfig>,
  );

  return {
    ...commandMenuItemsFromDefaultConfig,
    ...config,
  };
};

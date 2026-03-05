import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { type CommandMenuItemConfig } from '@/action-menu/actions/types/CommandMenuItemConfig';
import { type DefaultRecordActionConfigKeys } from '@/action-menu/actions/types/DefaultRecordActionConfigKeys';

export const inheritActionsFromDefaultConfig = ({
  config,
  actionKeys,
  propertiesToOverwrite,
}: {
  config: Record<string, CommandMenuItemConfig>;
  actionKeys: DefaultRecordActionConfigKeys[];
  propertiesToOverwrite: Partial<
    Record<DefaultRecordActionConfigKeys, Partial<CommandMenuItemConfig>>
  >;
}): Record<string, CommandMenuItemConfig> => {
  const actionsFromDefaultConfig = actionKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...DEFAULT_RECORD_ACTIONS_CONFIG[key],
        ...propertiesToOverwrite[key],
      },
    }),
    {} as Record<string, CommandMenuItemConfig>,
  );

  return {
    ...actionsFromDefaultConfig,
    ...config,
  };
};

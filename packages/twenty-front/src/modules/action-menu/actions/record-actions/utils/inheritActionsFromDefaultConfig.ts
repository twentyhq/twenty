import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { type DefaultRecordActionConfigKeys } from '@/action-menu/actions/types/DefaultRecordActionConfigKeys';

export const inheritActionsFromDefaultConfig = ({
  config,
  actionKeys,
  propertiesToOverwrite,
}: {
  config: Record<string, ActionConfig>;
  actionKeys: DefaultRecordActionConfigKeys[];
  propertiesToOverwrite: Partial<
    Record<DefaultRecordActionConfigKeys, Partial<ActionConfig>>
  >;
}): Record<string, ActionConfig> => {
  const actionsFromDefaultConfig = actionKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...DEFAULT_RECORD_ACTIONS_CONFIG[key],
        ...propertiesToOverwrite[key],
      },
    }),
    {} as Record<string, ActionConfig>,
  );

  return {
    ...actionsFromDefaultConfig,
    ...config,
  };
};

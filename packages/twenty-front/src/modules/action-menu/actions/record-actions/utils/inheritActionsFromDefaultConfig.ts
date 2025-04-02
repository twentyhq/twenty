import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { ConfigAction } from '@/action-menu/actions/types/ConfigAction';
import { DefaultRecordActionConfigKeys } from '@/action-menu/actions/types/DefaultRecordActionConfigKeys';

export const inheritActionsFromDefaultConfig = (
  config: Record<string, ConfigAction>,
  actionKeys: DefaultRecordActionConfigKeys[],
  propertiesToOverride: Partial<
    Record<DefaultRecordActionConfigKeys, Partial<ConfigAction>>
  >,
): Record<string, ConfigAction> => {
  const actionsFromDefaultConfig = actionKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...DEFAULT_RECORD_ACTIONS_CONFIG[key],
        ...propertiesToOverride[key],
      },
    }),
    {} as Record<string, ConfigAction>,
  );

  return {
    ...actionsFromDefaultConfig,
    ...config,
  };
};

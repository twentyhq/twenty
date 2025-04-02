import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { DefaultRecordActionConfigKeys } from '@/action-menu/actions/types/DefaultRecordActionConfigKeys';
import { RecordConfigAction } from '@/action-menu/actions/types/RecordConfigAction';

export const inheritActionsFromDefaultConfig = (
  config: Record<string, RecordConfigAction>,
  actionKeys: DefaultRecordActionConfigKeys[],
  propertiesToOverride: Partial<
    Record<DefaultRecordActionConfigKeys, Partial<RecordConfigAction>>
  >,
): Record<string, RecordConfigAction> => {
  const actionsFromDefaultConfig = actionKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...DEFAULT_RECORD_ACTIONS_CONFIG[key],
        ...propertiesToOverride[key],
      },
    }),
    {} as Record<string, RecordConfigAction>,
  );

  return {
    ...actionsFromDefaultConfig,
    ...config,
  };
};

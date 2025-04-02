import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';

export const inheritActionsFromDefaultConfig = (
  config: Record<
    string,
    ActionMenuEntry & {
      shouldBeRegistered?: (
        params: ShouldBeRegisteredFunctionParams,
      ) => boolean;
      useAction?: ActionHook;
    }
  >,
  actionKeys: (
    | NoSelectionRecordActionKeys
    | SingleRecordActionKeys
    | MultipleRecordsActionKeys
  )[],
  propertiesToOverride: Partial<
    Record<
      | NoSelectionRecordActionKeys
      | SingleRecordActionKeys
      | MultipleRecordsActionKeys,
      Partial<ActionMenuEntry>
    >
  >,
) => {
  return {
    ...actionKeys.map((key) => ({
      ...DEFAULT_RECORD_ACTIONS_CONFIG[key],
      ...propertiesToOverride[key],
    })),
    ...config,
  };
};

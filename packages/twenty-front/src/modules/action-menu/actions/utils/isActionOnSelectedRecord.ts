import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKey';
import { RecordAgnosticActionsKey } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKey';
import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';

const ACTION_KEYS_WITHOUT_SELECTED_RECORD = [
  NoSelectionRecordActionKeys.EXPORT_VIEW,
  NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
  MultipleRecordsActionKeys.DESTROY,
  MultipleRecordsActionKeys.EXPORT,
  MultipleRecordsActionKeys.DELETE,
  RecordAgnosticActionsKey.SEARCH_RECORDS,
  RecordAgnosticActionsKey.SEARCH_RECORDS_FALLBACK,
] as string[];

// TODO: this is a temporary solution, we need to refactor shouldBeRegistered
export const isActionOnSelectedRecord = (
  action: ActionMenuEntry & {
    useAction: ActionHook;
  },
) => {
  return !ACTION_KEYS_WITHOUT_SELECTED_RECORD.includes(action.key);
};

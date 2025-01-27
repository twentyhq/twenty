import { useSearchRecordsRecordAgnosticAction } from '@/action-menu/actions/record-agnostic-actions/hooks/useSearchRecordsRecordAgnosticAction';
import { RecordAgnosticActionsKey } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKey';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { IconSearch } from 'twenty-ui';

export const RECORD_AGNOSTIC_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    actionHook: ActionHookWithoutObjectMetadataItem;
  }
> = {
  searchRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKey.SEARCH_RECORDS,
    label: 'Search records',
    shortLabel: 'Search',
    position: 0,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.ALL],
    actionHook: useSearchRecordsRecordAgnosticAction,
  },
};

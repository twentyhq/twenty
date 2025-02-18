import { useSearchRecordsRecordAgnosticAction } from '@/action-menu/actions/record-agnostic-actions/hooks/useSearchRecordsRecordAgnosticAction';
import { RecordAgnosticActionsKey } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKey';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { msg } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui';

export const RECORD_AGNOSTIC_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    useAction: ActionHookWithoutObjectMetadataItem;
  }
> = {
  searchRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKey.SEARCH_RECORDS,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 0,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.GLOBAL],
    useAction: useSearchRecordsRecordAgnosticAction,
    hotKeys: ['/'],
  },
  searchRecordsFallback: {
    type: ActionMenuEntryType.Fallback,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKey.SEARCH_RECORDS_FALLBACK,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 1,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.GLOBAL],
    useAction: useSearchRecordsRecordAgnosticAction,
    hotKeys: ['/'],
  },
};

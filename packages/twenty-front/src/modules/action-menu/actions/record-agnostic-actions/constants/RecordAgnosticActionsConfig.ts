import { useSearchRecordsRecordAgnosticAction } from '@/action-menu/actions/record-agnostic-actions/hooks/useSearchRecordsRecordAgnosticAction';
import { RecordAgnosticActionsKeys } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { RecordAgnosticConfigAction } from '@/action-menu/actions/types/ConfigAction';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { msg } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui';

export const RECORD_AGNOSTIC_ACTIONS_CONFIG: Record<
  string,
  RecordAgnosticConfigAction
> = {
  [RecordAgnosticActionsKeys.SEARCH_RECORDS]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.SEARCH_RECORDS,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 0,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.GLOBAL],
    useAction: useSearchRecordsRecordAgnosticAction,
    hotKeys: ['/'],
    shouldBeRegistered: () => true,
  },
  [RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK]: {
    type: ActionMenuEntryType.Fallback,
    scope: ActionMenuEntryScope.Global,
    key: RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK,
    label: msg`Search records`,
    shortLabel: msg`Search`,
    position: 1,
    isPinned: false,
    Icon: IconSearch,
    availableOn: [ActionViewType.GLOBAL],
    useAction: useSearchRecordsRecordAgnosticAction,
    hotKeys: ['/'],
    shouldBeRegistered: () => true,
  },
};

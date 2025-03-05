import { useDeleteMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useDeleteMultipleRecordsAction';
import { useExportMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useExportMultipleRecordsAction';
import { useRestoreMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useRestoreMultipleRecordsAction';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { useImportRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useImportRecordsNoSelectionRecordAction';
import { useSeeDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeDeletedRecordsNoSelectionRecordAction';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKey';
import { useAddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useAddToFavoritesSingleRecordAction';
import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useRemoveFromFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useRemoveFromFavoritesSingleRecordAction';
import { useRestoreSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useRestoreSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { msg } from '@lingui/core/macro';
import {
  IconDatabaseExport,
  IconFileImport,
  IconHeart,
  IconHeartOff,
  IconRefresh,
  IconRotate2,
  IconTrash,
} from 'twenty-ui';

export const DEFAULT_ACTIONS_CONFIG_V1: Record<
  string,
  ActionMenuEntry & {
    useAction: ActionHook;
  }
> = {
  addToFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
    label: msg`Add to favorites`,
    position: 0,
    Icon: IconHeart,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useAddToFavoritesSingleRecordAction,
  },
  removeFromFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    label: msg`Remove from favorites`,
    position: 1,
    Icon: IconHeartOff,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useRemoveFromFavoritesSingleRecordAction,
  },
  deleteSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.DELETE,
    label: msg`Delete`,
    position: 2,
    Icon: IconTrash,
    accent: 'danger',
    isPinned: true,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useDeleteSingleRecordAction,
  },
  deleteMultipleRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.DELETE,
    label: msg`Delete records`,
    shortLabel: msg`Delete`,
    position: 3,
    Icon: IconTrash,
    accent: 'danger',
    isPinned: true,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    useAction: useDeleteMultipleRecordsAction,
  },
  exportSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT,
    label: msg`Export record`,
    shortLabel: msg`Export`,
    position: 4,
    Icon: IconDatabaseExport,
    accent: 'default',
    isPinned: false,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useExportMultipleRecordsAction,
  },
  exportMultipleRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.EXPORT,
    label: msg`Export records`,
    shortLabel: msg`Export`,
    position: 5,
    Icon: IconDatabaseExport,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    useAction: useExportMultipleRecordsAction,
  },
  exportView: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.EXPORT_VIEW,
    label: msg`Export view`,
    shortLabel: msg`Export`,
    position: 6,
    Icon: IconDatabaseExport,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useExportMultipleRecordsAction,
  },
  restoreSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.RESTORE,
    label: msg`Restore record`,
    shortLabel: msg`Restore`,
    position: 7,
    Icon: IconRefresh,
    accent: 'default',
    isPinned: true,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useRestoreSingleRecordAction,
  },
  restoreMultipleRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.RESTORE,
    label: msg`Restore records`,
    shortLabel: msg`Restore`,
    position: 8,
    Icon: IconRefresh,
    accent: 'default',
    isPinned: true,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    useAction: useRestoreMultipleRecordsAction,
  },
  seeDeletedRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
    label: msg`See deleted records`,
    shortLabel: msg`Deleted records`,
    position: 9,
    Icon: IconRotate2,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useSeeDeletedRecordsNoSelectionRecordAction,
  },
  importRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.IMPORT_RECORDS,
    label: msg`Import records`,
    shortLabel: msg`Import`,
    position: 10,
    Icon: IconFileImport,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useImportRecordsNoSelectionRecordAction,
  },
};

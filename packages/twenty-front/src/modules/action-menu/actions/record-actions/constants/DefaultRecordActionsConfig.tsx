import { DeleteMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/DeleteMultipleRecordsAction';
import { DestroyMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/DestroyMultipleRecordsAction';
import { ExportMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/ExportMultipleRecordsAction';
import { RestoreMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/RestoreMultipleRecordsAction';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { CreateNewTableRecordNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/CreateNewTableRecordNoSelectionRecordActionEffect';
import { HideDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/HideDeletedRecordsNoSelectionRecordActionEffect';
import { ImportRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/ImportRecordsNoSelectionRecordActionEffect';
import { SeeDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/SeeDeletedRecordsNoSelectionRecordActionEffect';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { AddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/AddToFavoritesSingleRecordAction';
import { DeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/DeleteSingleRecordAction';
import { DestroySingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/DestroySingleRecordAction';
import { ExportNoteActionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/ExportNoteActionSingleRecordAction';
import { NavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/NavigateToNextRecordSingleRecordAction';
import { NavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/NavigateToPreviousRecordSingleRecordAction';
import { RemoveFromFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/RemoveFromFavoritesSingleRecordAction';
import { RestoreSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/RestoreSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { BACKEND_BATCH_REQUEST_MAX_COUNT } from '@/object-record/constants/BackendBatchRequestMaxCount';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronUp,
  IconEyeOff,
  IconFileExport,
  IconFileImport,
  IconHeart,
  IconHeartOff,
  IconPlus,
  IconRefresh,
  IconRotate2,
  IconTrash,
  IconTrashX,
} from 'twenty-ui';

export const DEFAULT_RECORD_ACTIONS_CONFIG: Record<
  | NoSelectionRecordActionKeys
  | SingleRecordActionKeys
  | MultipleRecordsActionKeys,
  ActionConfig
> = {
  [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
    label: msg`Create new record`,
    shortLabel: msg`New record`,
    position: 0,
    isPinned: true,
    Icon: IconPlus,
    shouldBeRegistered: ({ hasObjectReadOnlyPermission }) =>
      !hasObjectReadOnlyPermission,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <CreateNewTableRecordNoSelectionRecordAction />,
  },
  [SingleRecordActionKeys.EXPORT_NOTE_TO_PDF]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT_NOTE_TO_PDF,
    label: msg`Export to PDF`,
    shortLabel: msg`Export`,
    position: 1,
    isPinned: false,
    Icon: IconFileExport,
    shouldBeRegistered: ({ selectedRecord, isNoteOrTask }) =>
      isDefined(isNoteOrTask) &&
      isNoteOrTask &&
      isNonEmptyString(selectedRecord?.bodyV2?.blocknote),
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <ExportNoteActionSingleRecordAction />,
  },
  [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
    label: msg`Add to favorites`,
    shortLabel: msg`Add to favorites`,
    position: 2,
    isPinned: true,
    Icon: IconHeart,
    shouldBeRegistered: ({ selectedRecord, isFavorite }) =>
      !selectedRecord?.isRemote && !isFavorite,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: <AddToFavoritesSingleRecordAction />,
  },
  [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    label: msg`Remove from favorites`,
    shortLabel: msg`Remove from favorites`,
    isPinned: true,
    position: 3,
    Icon: IconHeartOff,
    shouldBeRegistered: ({ selectedRecord, isFavorite }) =>
      isDefined(selectedRecord) &&
      !selectedRecord?.isRemote &&
      isDefined(isFavorite) &&
      isFavorite,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: <RemoveFromFavoritesSingleRecordAction />,
  },
  [SingleRecordActionKeys.EXPORT]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 4,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ selectedRecord }) =>
      isDefined(selectedRecord) && !selectedRecord.isRemote,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    component: <ExportMultipleRecordsAction />,
  },
  [MultipleRecordsActionKeys.EXPORT]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.EXPORT,
    label: msg`Export records`,
    shortLabel: msg`Export`,
    position: 5,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <ExportMultipleRecordsAction />,
  },
  [NoSelectionRecordActionKeys.EXPORT_VIEW]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.EXPORT_VIEW,
    label: msg`Export view`,
    shortLabel: msg`Export`,
    position: 6,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <ExportMultipleRecordsAction />,
  },
  [SingleRecordActionKeys.DELETE]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.DELETE,
    label: msg`Delete`,
    shortLabel: msg`Delete`,
    position: 7,
    Icon: IconTrash,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({ selectedRecord }) =>
      isDefined(selectedRecord) && !selectedRecord.isRemote,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: <DeleteSingleRecordAction />,
  },
  [MultipleRecordsActionKeys.DELETE]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.DELETE,
    label: msg`Delete records`,
    shortLabel: msg`Delete`,
    position: 8,
    Icon: IconTrash,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({
      hasObjectReadOnlyPermission,
      isRemote,
      isSoftDeleteFilterActive,
      numberOfSelectedRecords,
    }) =>
      !hasObjectReadOnlyPermission &&
      !isRemote &&
      !isSoftDeleteFilterActive &&
      isDefined(numberOfSelectedRecords) &&
      numberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <DeleteMultipleRecordsAction />,
  },
  [NoSelectionRecordActionKeys.SEE_DELETED_RECORDS]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
    label: msg`See deleted records`,
    shortLabel: msg`Deleted records`,
    position: 9,
    Icon: IconRotate2,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ isSoftDeleteFilterActive }) =>
      !isSoftDeleteFilterActive,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <SeeDeletedRecordsNoSelectionRecordAction />,
  },
  [NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS,
    label: msg`Hide deleted records`,
    shortLabel: msg`Hide deleted`,
    position: 10,
    Icon: IconEyeOff,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ isSoftDeleteFilterActive }) =>
      isDefined(isSoftDeleteFilterActive) && isSoftDeleteFilterActive,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <HideDeletedRecordsNoSelectionRecordAction />,
  },
  [NoSelectionRecordActionKeys.IMPORT_RECORDS]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.IMPORT_RECORDS,
    label: msg`Import records`,
    shortLabel: msg`Import`,
    position: 11,
    Icon: IconFileImport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <ImportRecordsNoSelectionRecordAction />,
  },
  [SingleRecordActionKeys.DESTROY]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.DESTROY,
    label: msg`Permanently destroy record`,
    shortLabel: msg`Destroy`,
    position: 12,
    Icon: IconTrashX,
    accent: 'danger',
    isPinned: true,
    shouldBeRegistered: ({
      selectedRecord,
      hasObjectReadOnlyPermission,
      isRemote,
    }) =>
      !hasObjectReadOnlyPermission &&
      !isRemote &&
      isDefined(selectedRecord?.deletedAt),
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: <DestroySingleRecordAction />,
  },
  [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    label: msg`Navigate to previous record`,
    position: 13,
    isPinned: true,
    Icon: IconChevronUp,
    shouldBeRegistered: ({ isInRightDrawer }) => !isInRightDrawer,
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <NavigateToPreviousRecordSingleRecordAction />,
  },
  [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    label: msg`Navigate to next record`,
    position: 14,
    isPinned: true,
    Icon: IconChevronDown,
    shouldBeRegistered: ({ isInRightDrawer }) => !isInRightDrawer,
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <NavigateToNextRecordSingleRecordAction />,
  },
  [MultipleRecordsActionKeys.DESTROY]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.DESTROY,
    label: msg`Permanently destroy records`,
    shortLabel: msg`Destroy`,
    position: 15,
    Icon: IconTrashX,
    accent: 'danger',
    isPinned: true,
    shouldBeRegistered: ({
      hasObjectReadOnlyPermission,
      isRemote,
      isSoftDeleteFilterActive,
      numberOfSelectedRecords,
    }) =>
      !hasObjectReadOnlyPermission &&
      !isRemote &&
      isDefined(isSoftDeleteFilterActive) &&
      isSoftDeleteFilterActive &&
      isDefined(numberOfSelectedRecords) &&
      numberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <DestroyMultipleRecordsAction />,
  },
  [SingleRecordActionKeys.RESTORE]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.RESTORE,
    label: msg`Restore record`,
    shortLabel: msg`Restore`,
    position: 16,
    Icon: IconRefresh,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({
      selectedRecord,
      hasObjectReadOnlyPermission,
      isRemote,
      isShowPage,
      isSoftDeleteFilterActive,
    }) =>
      !isRemote &&
      isDefined(selectedRecord?.deletedAt) &&
      !hasObjectReadOnlyPermission &&
      ((isDefined(isShowPage) && isShowPage) ||
        (isDefined(isSoftDeleteFilterActive) && isSoftDeleteFilterActive)),
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    component: <RestoreSingleRecordAction />,
  },
  [MultipleRecordsActionKeys.RESTORE]: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.RESTORE,
    label: msg`Restore records`,
    shortLabel: msg`Restore`,
    position: 17,
    Icon: IconRefresh,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({
      hasObjectReadOnlyPermission,
      isRemote,
      isSoftDeleteFilterActive,
      numberOfSelectedRecords,
    }) =>
      !hasObjectReadOnlyPermission &&
      !isRemote &&
      isDefined(isSoftDeleteFilterActive) &&
      isSoftDeleteFilterActive &&
      isDefined(numberOfSelectedRecords) &&
      numberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <RestoreMultipleRecordsAction />,
  },
};

import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { DeleteMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/DeleteMultipleRecordsAction';
import { DestroyMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/DestroyMultipleRecordsAction';
import { ExportMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/ExportMultipleRecordsAction';
import { RestoreMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/RestoreMultipleRecordsAction';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { CreateNewTableRecordNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/CreateNewTableRecordNoSelectionRecordAction';
import { HideDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/HideDeletedRecordsNoSelectionRecordAction';
import { ImportRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/ImportRecordsNoSelectionRecordAction';
import { SeeDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/SeeDeletedRecordsNoSelectionRecordAction';
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
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { BACKEND_BATCH_REQUEST_MAX_COUNT } from '@/object-record/constants/BackendBatchRequestMaxCount';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBuildingSkyscraper,
  IconCheckbox,
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
  IconSettings,
  IconSettingsAutomation,
  IconTargetArrow,
  IconTrash,
  IconTrashX,
  IconUser,
} from 'twenty-ui/display';

export const DEFAULT_RECORD_ACTIONS_CONFIG: Record<
  | NoSelectionRecordActionKeys
  | SingleRecordActionKeys
  | MultipleRecordsActionKeys,
  ActionConfig
> = {
  [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
    type: ActionType.Standard,
    scope: ActionScope.Object,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.Object,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.Object,
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
    type: ActionType.Standard,
    scope: ActionScope.Object,
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
    type: ActionType.Standard,
    scope: ActionScope.Object,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
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
  [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
    label: msg`Go to workflows`,
    shortLabel: msg`See workflows`,
    position: 18,
    Icon: IconSettingsAutomation,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ objectMetadataItem, viewType, isWorkflowEnabled }) =>
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Workflow ||
        viewType === ActionViewType.SHOW_PAGE) &&
      isWorkflowEnabled,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Workflow }}
      />
    ),
    hotKeys: ['G', 'W'],
  },
  [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_PEOPLE,
    label: msg`Go to People`,
    shortLabel: msg`People`,
    position: 19,
    Icon: IconUser,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({ objectMetadataItem, viewType }) =>
      objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Person ||
      viewType === ActionViewType.SHOW_PAGE,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Person }}
      />
    ),
    hotKeys: ['G', 'P'],
  },
  [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_COMPANIES,
    label: msg`Go to Companies`,
    shortLabel: msg`Companies`,
    position: 20,
    Icon: IconBuildingSkyscraper,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({ objectMetadataItem, viewType }) =>
      objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Company ||
      viewType === ActionViewType.SHOW_PAGE,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Company }}
      />
    ),
    hotKeys: ['G', 'C'],
  },
  [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
    label: msg`Go to Opportunities`,
    shortLabel: msg`Opportunities`,
    position: 21,
    Icon: IconTargetArrow,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({ objectMetadataItem, viewType }) =>
      objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Opportunity ||
      viewType === ActionViewType.SHOW_PAGE,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Opportunity }}
      />
    ),
    hotKeys: ['G', 'O'],
  },
  [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_SETTINGS,
    label: msg`Go to Settings`,
    shortLabel: msg`Settings`,
    position: 22,
    Icon: IconSettings,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: () => true,
    component: (
      <ActionLink
        to={AppPath.SettingsCatchAll}
        params={{
          '*': SettingsPath.ProfilePage,
        }}
      />
    ),
    hotKeys: ['G', 'S'],
  },
  [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_TASKS,
    label: msg`Go to Tasks`,
    shortLabel: msg`Tasks`,
    position: 23,
    Icon: IconCheckbox,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({ objectMetadataItem, viewType }) =>
      objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Task ||
      viewType === ActionViewType.SHOW_PAGE,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Task }}
      />
    ),
    hotKeys: ['G', 'T'],
  },
  [NoSelectionRecordActionKeys.GO_TO_NOTES]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_NOTES,
    label: msg`Go to Notes`,
    shortLabel: msg`Notes`,
    position: 24,
    Icon: IconCheckbox,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({ objectMetadataItem, viewType }) =>
      objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Note ||
      viewType === ActionViewType.SHOW_PAGE,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Note }}
      />
    ),
    hotKeys: ['G', 'N'],
  },
};

import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { DeleteMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/DeleteMultipleRecordsAction';
import { DestroyMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/DestroyMultipleRecordsAction';
import { ExportMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/ExportMultipleRecordsAction';
import { MergeMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/MergeMultipleRecordsAction';
import { RestoreMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/RestoreMultipleRecordsAction';
import { UpdateMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/components/UpdateMultipleRecordsAction';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { CreateNewIndexRecordNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/CreateNewIndexRecordNoSelectionRecordAction';
import { CreateNewViewNoSelectionRecord } from '@/action-menu/actions/record-actions/no-selection/components/CreateNewViewNoSelectionRecord';
import { HideDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/HideDeletedRecordsNoSelectionRecordAction';
import { ImportRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/ImportRecordsNoSelectionRecordAction';
import { SeeDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/components/SeeDeletedRecordsNoSelectionRecordAction';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { AddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/AddToFavoritesSingleRecordAction';
import { DeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/DeleteSingleRecordAction';
import { DestroySingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/DestroySingleRecordAction';
import { ExportNoteActionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/ExportNoteActionSingleRecordAction';
import { ExportSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/ExportSingleRecordAction';
import { NavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/NavigateToNextRecordSingleRecordAction';
import { NavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/NavigateToPreviousRecordSingleRecordAction';
import { RemoveFromFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/RemoveFromFavoritesSingleRecordAction';
import { RestoreSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/components/RestoreSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { BACKEND_BATCH_REQUEST_MAX_COUNT } from '@/object-record/constants/BackendBatchRequestMaxCount';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { MUTATION_MAX_MERGE_RECORDS } from 'twenty-shared/constants';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import {
  IconArrowMerge,
  IconBuildingSkyscraper,
  IconCheckbox,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconEyeOff,
  IconFileExport,
  IconFileImport,
  IconHeart,
  IconHeartOff,
  IconLayout,
  IconLayoutDashboard,
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

import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const DEFAULT_RECORD_ACTIONS_CONFIG: Record<
  | NoSelectionRecordActionKeys
  | SingleRecordActionKeys
  | MultipleRecordsActionKeys,
  ActionConfig
> = {
  [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    label: msg`Navigate to next record`,
    position: 0,
    isPinned: true,
    Icon: IconChevronDown,
    shouldBeRegistered: ({ isInRightDrawer }) => !isInRightDrawer,
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <NavigateToNextRecordSingleRecordAction />,
  },
  [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    label: msg`Navigate to previous record`,
    position: 1,
    isPinned: true,
    Icon: IconChevronUp,
    shouldBeRegistered: ({ isInRightDrawer }) => !isInRightDrawer,
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <NavigateToPreviousRecordSingleRecordAction />,
  },
  [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
    type: ActionType.Standard,
    scope: ActionScope.Object,
    key: NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
    label: msg`Create new record`,
    shortLabel: msg`New record`,
    position: 2,
    isPinned: true,
    Icon: IconPlus,
    shouldBeRegistered: ({ objectPermissions, hasAnySoftDeleteFilterOnView }) =>
      (objectPermissions.canUpdateObjectRecords &&
        !hasAnySoftDeleteFilterOnView) ??
      false,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <CreateNewIndexRecordNoSelectionRecordAction />,
  },
  [SingleRecordActionKeys.DELETE]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.DELETE,
    label: msg`Delete`,
    shortLabel: msg`Delete`,
    position: 3,
    Icon: IconTrash,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({
      selectedRecord,
      hasAnySoftDeleteFilterOnView,
      objectPermissions,
    }) =>
      (isDefined(selectedRecord) &&
        !selectedRecord.isRemote &&
        !hasAnySoftDeleteFilterOnView &&
        objectPermissions.canSoftDeleteObjectRecords &&
        !isDefined(selectedRecord?.deletedAt)) ??
      false,
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
    position: 4,
    Icon: IconTrash,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({
      objectPermissions,
      isRemote,
      hasAnySoftDeleteFilterOnView,
      numberOfSelectedRecords,
    }) =>
      (objectPermissions.canSoftDeleteObjectRecords &&
        !isRemote &&
        !hasAnySoftDeleteFilterOnView &&
        isDefined(numberOfSelectedRecords) &&
        numberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT) ??
      false,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <DeleteMultipleRecordsAction />,
  },
  [SingleRecordActionKeys.RESTORE]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.RESTORE,
    label: msg`Restore record`,
    shortLabel: msg`Restore`,
    position: 5,
    Icon: IconRefresh,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({
      selectedRecord,
      objectPermissions,
      isRemote,
      isShowPage,
      hasAnySoftDeleteFilterOnView,
    }) =>
      (!isRemote &&
        isDefined(selectedRecord?.deletedAt) &&
        objectPermissions.canSoftDeleteObjectRecords &&
        ((isDefined(isShowPage) && isShowPage) ||
          (isDefined(hasAnySoftDeleteFilterOnView) &&
            hasAnySoftDeleteFilterOnView))) ??
      false,
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
    position: 6,
    Icon: IconRefresh,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({
      objectPermissions,
      isRemote,
      hasAnySoftDeleteFilterOnView,
      numberOfSelectedRecords,
    }) =>
      (objectPermissions.canSoftDeleteObjectRecords &&
        !isRemote &&
        isDefined(hasAnySoftDeleteFilterOnView) &&
        hasAnySoftDeleteFilterOnView &&
        isDefined(numberOfSelectedRecords) &&
        numberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT) ??
      false,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <RestoreMultipleRecordsAction />,
  },
  [SingleRecordActionKeys.DESTROY]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.DESTROY,
    label: msg`Permanently destroy record`,
    shortLabel: msg`Destroy`,
    position: 7,
    Icon: IconTrashX,
    accent: 'danger',
    isPinned: true,
    shouldBeRegistered: ({ selectedRecord, objectPermissions, isRemote }) =>
      (objectPermissions.canDestroyObjectRecords &&
        !isRemote &&
        isDefined(selectedRecord?.deletedAt)) ??
      false,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: <DestroySingleRecordAction />,
  },
  [MultipleRecordsActionKeys.DESTROY]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: MultipleRecordsActionKeys.DESTROY,
    label: msg`Permanently destroy records`,
    shortLabel: msg`Destroy`,
    position: 8,
    Icon: IconTrashX,
    accent: 'danger',
    isPinned: true,
    shouldBeRegistered: ({
      objectPermissions,
      isRemote,
      hasAnySoftDeleteFilterOnView,
      numberOfSelectedRecords,
    }) =>
      (objectPermissions.canDestroyObjectRecords &&
        !isRemote &&
        isDefined(hasAnySoftDeleteFilterOnView) &&
        hasAnySoftDeleteFilterOnView &&
        isDefined(numberOfSelectedRecords) &&
        numberOfSelectedRecords < BACKEND_BATCH_REQUEST_MAX_COUNT) ??
      false,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <DestroyMultipleRecordsAction />,
  },

  [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
    label: msg`Add to favorites`,
    shortLabel: msg`Add to favorites`,
    position: 9,
    isPinned: true,
    Icon: IconHeart,
    shouldBeRegistered: ({
      selectedRecord,
      isFavorite,
      hasAnySoftDeleteFilterOnView,
    }) =>
      !selectedRecord?.isRemote &&
      !isFavorite &&
      !isDefined(selectedRecord?.deletedAt) &&
      !hasAnySoftDeleteFilterOnView,
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
    position: 10,
    Icon: IconHeartOff,
    shouldBeRegistered: ({
      selectedRecord,
      isFavorite,
      hasAnySoftDeleteFilterOnView,
    }) =>
      isDefined(selectedRecord) &&
      !selectedRecord?.isRemote &&
      isDefined(isFavorite) &&
      isFavorite &&
      !isDefined(selectedRecord?.deletedAt) &&
      !hasAnySoftDeleteFilterOnView,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: <RemoveFromFavoritesSingleRecordAction />,
  },
  [SingleRecordActionKeys.EXPORT_NOTE_TO_PDF]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT_NOTE_TO_PDF,
    label: msg`Export to PDF`,
    shortLabel: msg`Export`,
    position: 11,
    isPinned: false,
    Icon: IconFileExport,
    shouldBeRegistered: ({ selectedRecord, isNoteOrTask }) =>
      isDefined(isNoteOrTask) &&
      isNoteOrTask &&
      isNonEmptyString(selectedRecord?.bodyV2?.blocknote),
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <ExportNoteActionSingleRecordAction />,
  },
  [SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 12,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ selectedRecord }) =>
      isDefined(selectedRecord) && !selectedRecord.isRemote,
    availableOn: [ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION],
    component: <ExportMultipleRecordsAction />,
    requiredPermissionFlag: PermissionFlagType.EXPORT_CSV,
  },
  [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 13,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ selectedRecord }) =>
      isDefined(selectedRecord) && !selectedRecord.isRemote,
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <ExportSingleRecordAction />,
    requiredPermissionFlag: PermissionFlagType.EXPORT_CSV,
  },
  [MultipleRecordsActionKeys.UPDATE]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: MultipleRecordsActionKeys.UPDATE,
    label: msg`Update records`,
    shortLabel: msg`Update`,
    position: 14,
    Icon: IconEdit,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({ objectPermissions, isRemote }) =>
      objectPermissions.canUpdateObjectRecords && !isRemote,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <UpdateMultipleRecordsAction />,
  },
  [MultipleRecordsActionKeys.MERGE]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: MultipleRecordsActionKeys.MERGE,
    label: msg`Merge records`,
    shortLabel: msg`Merge`,
    position: 15,
    Icon: IconArrowMerge,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({
      objectMetadataItem,
      numberOfSelectedRecords,
      objectPermissions,
    }) =>
      isDefined(objectMetadataItem?.duplicateCriteria) &&
      isDefined(numberOfSelectedRecords) &&
      Boolean(objectPermissions.canUpdateObjectRecords) &&
      Boolean(objectPermissions.canDestroyObjectRecords) &&
      numberOfSelectedRecords <= MUTATION_MAX_MERGE_RECORDS,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <MergeMultipleRecordsAction />,
  },
  [MultipleRecordsActionKeys.EXPORT]: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: MultipleRecordsActionKeys.EXPORT,
    label: msg`Export records`,
    shortLabel: msg`Export`,
    position: 16,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    component: <ExportMultipleRecordsAction />,
    requiredPermissionFlag: PermissionFlagType.EXPORT_CSV,
  },
  [NoSelectionRecordActionKeys.IMPORT_RECORDS]: {
    type: ActionType.Standard,
    scope: ActionScope.Object,
    key: NoSelectionRecordActionKeys.IMPORT_RECORDS,
    label: msg`Import records`,
    shortLabel: msg`Import`,
    position: 17,
    Icon: IconFileImport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
      !hasAnySoftDeleteFilterOnView,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <ImportRecordsNoSelectionRecordAction />,
    requiredPermissionFlag: PermissionFlagType.IMPORT_CSV,
  },
  [NoSelectionRecordActionKeys.EXPORT_VIEW]: {
    type: ActionType.Standard,
    scope: ActionScope.Object,
    key: NoSelectionRecordActionKeys.EXPORT_VIEW,
    label: msg`Export view`,
    shortLabel: msg`Export`,
    position: 18,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <ExportMultipleRecordsAction />,
    requiredPermissionFlag: PermissionFlagType.EXPORT_CSV,
  },
  [NoSelectionRecordActionKeys.SEE_DELETED_RECORDS]: {
    type: ActionType.Standard,
    scope: ActionScope.Object,
    key: NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
    label: msg`See deleted records`,
    shortLabel: msg`Deleted records`,
    position: 19,
    Icon: IconRotate2,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
      !hasAnySoftDeleteFilterOnView,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <SeeDeletedRecordsNoSelectionRecordAction />,
  },
  [NoSelectionRecordActionKeys.CREATE_NEW_VIEW]: {
    type: ActionType.Standard,
    scope: ActionScope.Object,
    key: NoSelectionRecordActionKeys.CREATE_NEW_VIEW,
    label: msg`Create View`,
    shortLabel: msg`Create View`,
    position: 20,
    Icon: IconLayout,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
      !hasAnySoftDeleteFilterOnView,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <CreateNewViewNoSelectionRecord />,
  },
  [NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS]: {
    type: ActionType.Standard,
    scope: ActionScope.Object,
    key: NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS,
    label: msg`Hide deleted records`,
    shortLabel: msg`Hide deleted`,
    position: 21,
    Icon: IconEyeOff,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
      isDefined(hasAnySoftDeleteFilterOnView) && hasAnySoftDeleteFilterOnView,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    component: <HideDeletedRecordsNoSelectionRecordAction />,
  },
  [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
    label: msg`Go to Workflows`,
    shortLabel: msg`See Workflows`,
    position: 22,
    Icon: IconSettingsAutomation,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Workflow) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Workflow ||
        viewType === ActionViewType.SHOW_PAGE),
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
      ActionViewType.PAGE_EDIT_MODE,
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
    position: 23,
    Icon: IconUser,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
      ActionViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Person) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Person ||
        viewType === ActionViewType.SHOW_PAGE),
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
    position: 24,
    Icon: IconBuildingSkyscraper,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
      ActionViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Company) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Company ||
        viewType === ActionViewType.SHOW_PAGE),
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Company }}
      />
    ),
    hotKeys: ['G', 'C'],
  },
  [NoSelectionRecordActionKeys.GO_TO_DASHBOARDS]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_DASHBOARDS,
    label: msg`Go to Dashboards`,
    shortLabel: msg`Dashboards`,
    position: 25,
    Icon: IconLayoutDashboard,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Dashboard) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Dashboard ||
        viewType === ActionViewType.SHOW_PAGE),
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Dashboard }}
      />
    ),
    hotKeys: ['G', 'D'],
  },
  [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
    label: msg`Go to Opportunities`,
    shortLabel: msg`Opportunities`,
    position: 26,
    Icon: IconTargetArrow,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
      ActionViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Opportunity) &&
      (objectMetadataItem?.nameSingular !==
        CoreObjectNameSingular.Opportunity ||
        viewType === ActionViewType.SHOW_PAGE),
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
    position: 27,
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
    position: 28,
    Icon: IconCheckbox,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
      ActionViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Task) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Task ||
        viewType === ActionViewType.SHOW_PAGE),
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
    position: 29,
    Icon: IconCheckbox,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
      ActionViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Note) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Note ||
        viewType === ActionViewType.SHOW_PAGE),
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Note }}
      />
    ),
    hotKeys: ['G', 'N'],
  },
};

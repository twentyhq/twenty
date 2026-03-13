import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { DeleteMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/DeleteMultipleRecordsCommand';
import { DestroyMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/DestroyMultipleRecordsCommand';
import { ExportMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/ExportMultipleRecordsCommand';
import { MergeMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/MergeMultipleRecordsCommand';
import { RestoreMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/RestoreMultipleRecordsCommand';
import { UpdateMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/UpdateMultipleRecordsCommand';
import { MultipleRecordsCommandKeys } from '@/command-menu-item/record/multiple-records/types/MultipleRecordsCommandKeys';
import { CreateNewIndexRecordNoSelectionRecordCommand } from '@/command-menu-item/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand';
import { CreateNewViewNoSelectionRecordCommand } from '@/command-menu-item/record/no-selection/components/CreateNewViewNoSelectionRecordCommand';
import { HideDeletedRecordsNoSelectionRecordCommand } from '@/command-menu-item/record/no-selection/components/HideDeletedRecordsNoSelectionRecordCommand';
import { ImportRecordsNoSelectionRecordCommand } from '@/command-menu-item/record/no-selection/components/ImportRecordsNoSelectionRecordCommand';
import { SeeDeletedRecordsNoSelectionRecordCommand } from '@/command-menu-item/record/no-selection/components/SeeDeletedRecordsNoSelectionRecordCommand';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { AddToFavoritesSingleRecordCommand } from '@/command-menu-item/record/single-record/components/AddToFavoritesSingleRecordCommand';
import { DeleteSingleRecordCommand } from '@/command-menu-item/record/single-record/components/DeleteSingleRecordCommand';
import { DestroySingleRecordCommand } from '@/command-menu-item/record/single-record/components/DestroySingleRecordCommand';
import { ExportNoteSingleRecordCommand } from '@/command-menu-item/record/single-record/components/ExportNoteSingleRecordCommand';
import { ExportSingleRecordCommand } from '@/command-menu-item/record/single-record/components/ExportSingleRecordCommand';
import { NavigateToNextRecordSingleRecordCommand } from '@/command-menu-item/record/single-record/components/NavigateToNextRecordSingleRecordCommand';
import { NavigateToPreviousRecordSingleRecordCommand } from '@/command-menu-item/record/single-record/components/NavigateToPreviousRecordSingleRecordCommand';
import { RemoveFromFavoritesSingleRecordCommand } from '@/command-menu-item/record/single-record/components/RemoveFromFavoritesSingleRecordCommand';
import { RestoreSingleRecordCommand } from '@/command-menu-item/record/single-record/components/RestoreSingleRecordCommand';
import { EditRecordPageLayoutSingleRecordCommand } from '@/command-menu-item/record/single-record/record-page-layout/components/EditRecordPageLayoutSingleRecordCommand';
import { RecordPageLayoutSingleRecordCommandKeys } from '@/command-menu-item/record/single-record/record-page-layout/types/RecordPageLayoutSingleRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  BACKEND_BATCH_REQUEST_MAX_COUNT,
  MUTATION_MAX_MERGE_RECORDS,
} from 'twenty-shared/constants';
import {
  AppPath,
  CommandMenuItemViewType,
  CoreObjectNameSingular,
  SettingsPath,
} from 'twenty-shared/types';
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
  IconPencil,
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
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG: Record<
  | NoSelectionRecordCommandKeys
  | SingleRecordCommandKeys
  | MultipleRecordsCommandKeys
  | RecordPageLayoutSingleRecordCommandKeys,
  CommandMenuItemConfig
> = {
  [SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD,
    label: msg`Navigate to next record`,
    position: 0,
    isPinned: true,
    Icon: IconChevronDown,
    shouldBeRegistered: ({ isInSidePanel }) => !isInSidePanel,
    availableOn: [CommandMenuItemViewType.SHOW_PAGE],
    component: <NavigateToNextRecordSingleRecordCommand />,
  },
  [SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    label: msg`Navigate to previous record`,
    position: 1,
    isPinned: true,
    Icon: IconChevronUp,
    shouldBeRegistered: ({ isInSidePanel }) => !isInSidePanel,
    availableOn: [CommandMenuItemViewType.SHOW_PAGE],
    component: <NavigateToPreviousRecordSingleRecordCommand />,
  },
  [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Object,
    key: NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
    label: msg`Create new record`,
    shortLabel: msg`New record`,
    position: 2,
    isPinned: true,
    Icon: IconPlus,
    shouldBeRegistered: ({
      objectMetadataItem,
      objectPermissions,
      hasAnySoftDeleteFilterOnView,
    }) =>
      (!objectMetadataItem?.isSystem &&
        objectPermissions.canUpdateObjectRecords &&
        !hasAnySoftDeleteFilterOnView) ??
      false,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION],
    component: <CreateNewIndexRecordNoSelectionRecordCommand />,
  },
  [SingleRecordCommandKeys.DELETE]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.DELETE,
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
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    component: <DeleteSingleRecordCommand />,
  },
  [MultipleRecordsCommandKeys.DELETE]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: MultipleRecordsCommandKeys.DELETE,
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
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION],
    component: <DeleteMultipleRecordsCommand />,
  },
  [SingleRecordCommandKeys.RESTORE]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.RESTORE,
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
      CommandMenuItemViewType.SHOW_PAGE,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    component: <RestoreSingleRecordCommand />,
  },
  [MultipleRecordsCommandKeys.RESTORE]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: MultipleRecordsCommandKeys.RESTORE,
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
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION],
    component: <RestoreMultipleRecordsCommand />,
  },
  [SingleRecordCommandKeys.DESTROY]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.DESTROY,
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
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    component: <DestroySingleRecordCommand />,
  },
  [MultipleRecordsCommandKeys.DESTROY]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: MultipleRecordsCommandKeys.DESTROY,
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
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION],
    component: <DestroyMultipleRecordsCommand />,
  },

  [SingleRecordCommandKeys.ADD_TO_FAVORITES]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.ADD_TO_FAVORITES,
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
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    component: <AddToFavoritesSingleRecordCommand />,
  },
  [SingleRecordCommandKeys.REMOVE_FROM_FAVORITES]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.REMOVE_FROM_FAVORITES,
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
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    component: <RemoveFromFavoritesSingleRecordCommand />,
  },
  [SingleRecordCommandKeys.EXPORT_NOTE_TO_PDF]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.EXPORT_NOTE_TO_PDF,
    label: msg`Export to PDF`,
    shortLabel: msg`Export`,
    position: 11,
    isPinned: false,
    Icon: IconFileExport,
    shouldBeRegistered: ({ selectedRecord, isNoteOrTask }) =>
      isDefined(isNoteOrTask) &&
      isNoteOrTask &&
      isNonEmptyString(selectedRecord?.bodyV2?.blocknote),
    availableOn: [CommandMenuItemViewType.SHOW_PAGE],
    component: <ExportNoteSingleRecordCommand />,
  },
  [SingleRecordCommandKeys.EXPORT_FROM_RECORD_INDEX]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.EXPORT_FROM_RECORD_INDEX,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 12,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ selectedRecord }) =>
      isDefined(selectedRecord) && !selectedRecord.isRemote,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION],
    component: <ExportMultipleRecordsCommand />,
    requiredPermissionFlag: PermissionFlagType.EXPORT_CSV,
  },
  [SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 13,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ selectedRecord }) =>
      isDefined(selectedRecord) && !selectedRecord.isRemote,
    availableOn: [CommandMenuItemViewType.SHOW_PAGE],
    component: <ExportSingleRecordCommand />,
    requiredPermissionFlag: PermissionFlagType.EXPORT_CSV,
  },
  [MultipleRecordsCommandKeys.UPDATE]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: MultipleRecordsCommandKeys.UPDATE,
    label: msg`Update records`,
    shortLabel: msg`Update`,
    position: 14,
    Icon: IconEdit,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: ({ objectPermissions, isRemote }) =>
      objectPermissions.canUpdateObjectRecords && !isRemote,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION],
    component: <UpdateMultipleRecordsCommand />,
  },
  [MultipleRecordsCommandKeys.MERGE]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: MultipleRecordsCommandKeys.MERGE,
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
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION],
    component: <MergeMultipleRecordsCommand />,
  },
  [MultipleRecordsCommandKeys.EXPORT]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: MultipleRecordsCommandKeys.EXPORT,
    label: msg`Export records`,
    shortLabel: msg`Export`,
    position: 16,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION],
    component: <ExportMultipleRecordsCommand />,
    requiredPermissionFlag: PermissionFlagType.EXPORT_CSV,
  },
  [NoSelectionRecordCommandKeys.IMPORT_RECORDS]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Object,
    key: NoSelectionRecordCommandKeys.IMPORT_RECORDS,
    label: msg`Import records`,
    shortLabel: msg`Import`,
    position: 17,
    Icon: IconFileImport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({
      objectMetadataItem,
      hasAnySoftDeleteFilterOnView,
    }) => !objectMetadataItem?.isSystem && !hasAnySoftDeleteFilterOnView,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION],
    component: <ImportRecordsNoSelectionRecordCommand />,
    requiredPermissionFlag: PermissionFlagType.IMPORT_CSV,
  },
  [NoSelectionRecordCommandKeys.EXPORT_VIEW]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Object,
    key: NoSelectionRecordCommandKeys.EXPORT_VIEW,
    label: msg`Export view`,
    shortLabel: msg`Export`,
    position: 18,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION],
    component: <ExportMultipleRecordsCommand />,
    requiredPermissionFlag: PermissionFlagType.EXPORT_CSV,
  },
  [NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Object,
    key: NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS,
    label: msg`See deleted records`,
    shortLabel: msg`Deleted records`,
    position: 19,
    Icon: IconRotate2,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
      !hasAnySoftDeleteFilterOnView,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION],
    component: <SeeDeletedRecordsNoSelectionRecordCommand />,
  },
  [NoSelectionRecordCommandKeys.CREATE_NEW_VIEW]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Object,
    key: NoSelectionRecordCommandKeys.CREATE_NEW_VIEW,
    label: msg`Create View`,
    shortLabel: msg`Create View`,
    position: 20,
    Icon: IconLayout,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
      !hasAnySoftDeleteFilterOnView,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION],
    component: <CreateNewViewNoSelectionRecordCommand />,
  },
  [NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS]: {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.Object,
    key: NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS,
    label: msg`Hide deleted records`,
    shortLabel: msg`Hide deleted`,
    position: 21,
    Icon: IconEyeOff,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
      isDefined(hasAnySoftDeleteFilterOnView) && hasAnySoftDeleteFilterOnView,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION],
    component: <HideDeletedRecordsNoSelectionRecordCommand />,
  },
  [NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS,
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
        viewType === CommandMenuItemViewType.SHOW_PAGE),
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
      CommandMenuItemViewType.PAGE_EDIT_MODE,
    ],
    component: (
      <CommandLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Workflow }}
      />
    ),
    hotKeys: ['G', 'W'],
  },
  [NoSelectionRecordCommandKeys.GO_TO_PEOPLE]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_PEOPLE,
    label: msg`Go to People`,
    shortLabel: msg`People`,
    position: 23,
    Icon: IconUser,
    isPinned: false,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
      CommandMenuItemViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Person) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Person ||
        viewType === CommandMenuItemViewType.SHOW_PAGE),
    component: (
      <CommandLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Person }}
      />
    ),
    hotKeys: ['G', 'P'],
  },
  [NoSelectionRecordCommandKeys.GO_TO_COMPANIES]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_COMPANIES,
    label: msg`Go to Companies`,
    shortLabel: msg`Companies`,
    position: 24,
    Icon: IconBuildingSkyscraper,
    isPinned: false,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
      CommandMenuItemViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Company) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Company ||
        viewType === CommandMenuItemViewType.SHOW_PAGE),
    component: (
      <CommandLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Company }}
      />
    ),
    hotKeys: ['G', 'C'],
  },
  [NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS,
    label: msg`Go to Dashboards`,
    shortLabel: msg`Dashboards`,
    position: 25,
    Icon: IconLayoutDashboard,
    isPinned: false,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Dashboard) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Dashboard ||
        viewType === CommandMenuItemViewType.SHOW_PAGE),
    component: (
      <CommandLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Dashboard }}
      />
    ),
    hotKeys: ['G', 'D'],
  },
  [NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES,
    label: msg`Go to Opportunities`,
    shortLabel: msg`Opportunities`,
    position: 26,
    Icon: IconTargetArrow,
    isPinned: false,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
      CommandMenuItemViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Opportunity) &&
      (objectMetadataItem?.nameSingular !==
        CoreObjectNameSingular.Opportunity ||
        viewType === CommandMenuItemViewType.SHOW_PAGE),
    component: (
      <CommandLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Opportunity }}
      />
    ),
    hotKeys: ['G', 'O'],
  },
  [NoSelectionRecordCommandKeys.GO_TO_SETTINGS]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_SETTINGS,
    label: msg`Go to Settings`,
    shortLabel: msg`Settings`,
    position: 27,
    Icon: IconSettings,
    isPinned: false,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: () => true,
    component: (
      <CommandLink
        to={AppPath.SettingsCatchAll}
        params={{
          '*': SettingsPath.ProfilePage,
        }}
      />
    ),
    hotKeys: ['G', 'S'],
  },
  [NoSelectionRecordCommandKeys.GO_TO_TASKS]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_TASKS,
    label: msg`Go to Tasks`,
    shortLabel: msg`Tasks`,
    position: 28,
    Icon: IconCheckbox,
    isPinned: false,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
      CommandMenuItemViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Task) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Task ||
        viewType === CommandMenuItemViewType.SHOW_PAGE),
    component: (
      <CommandLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Task }}
      />
    ),
    hotKeys: ['G', 'T'],
  },
  [NoSelectionRecordCommandKeys.GO_TO_NOTES]: {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_NOTES,
    label: msg`Go to Notes`,
    shortLabel: msg`Notes`,
    position: 29,
    Icon: IconCheckbox,
    isPinned: false,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
      CommandMenuItemViewType.PAGE_EDIT_MODE,
    ],
    shouldBeRegistered: ({
      objectMetadataItem,
      viewType,
      getTargetObjectReadPermission,
    }) =>
      getTargetObjectReadPermission(CoreObjectNameSingular.Note) &&
      (objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Note ||
        viewType === CommandMenuItemViewType.SHOW_PAGE),
    component: (
      <CommandLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Note }}
      />
    ),
    hotKeys: ['G', 'N'],
  },

  [RecordPageLayoutSingleRecordCommandKeys.EDIT_RECORD_PAGE_LAYOUT]: {
    key: RecordPageLayoutSingleRecordCommandKeys.EDIT_RECORD_PAGE_LAYOUT,
    label: msg`Edit Layout`,
    shortLabel: msg`Edit Layout`,
    isPinned: false,
    position: 30,
    Icon: IconPencil,
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    requiredPermissionFlag: PermissionFlagType.LAYOUTS,
    shouldBeRegistered: ({
      selectedRecord,
      objectPermissions,
      objectMetadataItem,
      isFeatureFlagEnabled,
    }) =>
      isFeatureFlagEnabled(
        FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
      ) &&
      isDefined(selectedRecord) &&
      !selectedRecord?.isRemote &&
      !isDefined(selectedRecord?.deletedAt) &&
      objectPermissions.canUpdateObjectRecords &&
      objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Dashboard,
    availableOn: [CommandMenuItemViewType.SHOW_PAGE],
    component: <EditRecordPageLayoutSingleRecordCommand />,
  },
};

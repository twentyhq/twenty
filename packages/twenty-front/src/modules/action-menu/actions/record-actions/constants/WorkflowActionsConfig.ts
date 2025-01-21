import { useDeleteMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useDeleteMultipleRecordsAction';
import { useExportMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useExportMultipleRecordsAction';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { useCreateNewTableRecordNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useCreateNewTableRecordNoSelectionRecordAction';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKey';
import { useAddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useAddToFavoritesSingleRecordAction';
import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useDestroySingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDestroySingleRecordAction';
import { useNavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToNextRecordSingleRecordAction';
import { useNavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToPreviousRecordSingleRecordAction';
import { useRemoveFromFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useRemoveFromFavoritesSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { useActivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowSingleRecordAction';
import { useDeactivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowSingleRecordAction';
import { useDiscardDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardDraftWorkflowSingleRecordAction';
import { useSeeActiveVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeActiveVersionWorkflowSingleRecordAction';
import { useSeeRunsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeRunsWorkflowSingleRecordAction';
import { useSeeVersionsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeVersionsWorkflowSingleRecordAction';
import { useTestWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useTestWorkflowSingleRecordAction';
import { WorkflowSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-actions/types/WorkflowSingleRecordActionsKeys';
import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
  IconChevronDown,
  IconChevronUp,
  IconDatabaseExport,
  IconHeart,
  IconHeartOff,
  IconHistory,
  IconHistoryToggle,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconPower,
  IconTrash,
  IconTrashX,
} from 'twenty-ui';

export const WORKFLOW_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    actionHook: ActionHook;
  }
> = {
  createNewRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
    label: 'Create new record',
    shortLabel: 'New record',
    position: 0,
    isPinned: true,
    Icon: IconPlus,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    actionHook: useCreateNewTableRecordNoSelectionRecordAction,
  },
  activateWorkflowSingleRecord: {
    key: WorkflowSingleRecordActionKeys.ACTIVATE,
    label: 'Activate Workflow',
    shortLabel: 'Activate',
    isPinned: true,
    position: 1,
    Icon: IconPower,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useActivateWorkflowSingleRecordAction,
  },
  deactivateWorkflowSingleRecord: {
    key: WorkflowSingleRecordActionKeys.DEACTIVATE,
    label: 'Deactivate Workflow',
    shortLabel: 'Deactivate',
    isPinned: true,
    position: 2,
    Icon: IconPlayerPause,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useDeactivateWorkflowSingleRecordAction,
  },
  discardWorkflowDraftSingleRecord: {
    key: WorkflowSingleRecordActionKeys.DISCARD_DRAFT,
    label: 'Discard Draft',
    shortLabel: 'Discard Draft',
    isPinned: true,
    position: 3,
    Icon: IconTrash,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useDiscardDraftWorkflowSingleRecordAction,
  },
  seeWorkflowActiveVersionSingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_ACTIVE_VERSION,
    label: 'See active version',
    shortLabel: 'See active version',
    isPinned: false,
    position: 4,
    Icon: IconHistory,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useSeeActiveVersionWorkflowSingleRecordAction,
  },
  seeWorkflowRunsSingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_RUNS,
    label: 'See runs',
    shortLabel: 'See runs',
    isPinned: false,
    position: 5,
    Icon: IconHistoryToggle,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useSeeRunsWorkflowSingleRecordAction,
  },
  seeWorkflowVersionsHistorySingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_VERSIONS,
    label: 'See versions history',
    shortLabel: 'See versions',
    isPinned: false,
    position: 6,
    Icon: IconHistory,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useSeeVersionsWorkflowSingleRecordAction,
  },
  testWorkflowSingleRecord: {
    key: WorkflowSingleRecordActionKeys.TEST,
    label: 'Test Workflow',
    shortLabel: 'Test',
    isPinned: true,
    position: 7,
    Icon: IconPlayerPlay,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useTestWorkflowSingleRecordAction,
  },
  navigateToPreviousRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    label: 'Navigate to previous workflow',
    shortLabel: '',
    position: 8,
    Icon: IconChevronUp,
    availableOn: [ActionViewType.SHOW_PAGE],
    actionHook: useNavigateToPreviousRecordSingleRecordAction,
  },
  navigateToNextRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    label: 'Navigate to next workflow',
    shortLabel: '',
    position: 9,
    Icon: IconChevronDown,
    availableOn: [ActionViewType.SHOW_PAGE],
    actionHook: useNavigateToNextRecordSingleRecordAction,
  },
  addToFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
    label: 'Add to favorites',
    shortLabel: 'Add to favorites',
    position: 10,
    isPinned: false,
    Icon: IconHeart,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    actionHook: useAddToFavoritesSingleRecordAction,
  },
  removeFromFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    label: 'Remove from favorites',
    shortLabel: 'Remove from favorites',
    isPinned: false,
    position: 11,
    Icon: IconHeartOff,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    actionHook: useRemoveFromFavoritesSingleRecordAction,
  },
  deleteSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.DELETE,
    label: 'Delete record',
    shortLabel: 'Delete',
    position: 12,
    Icon: IconTrash,
    accent: 'danger',
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    actionHook: useDeleteSingleRecordAction,
  },
  deleteMultipleRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.DELETE,
    label: 'Delete records',
    shortLabel: 'Delete',
    position: 13,
    Icon: IconTrash,
    accent: 'danger',
    isPinned: true,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    actionHook: useDeleteMultipleRecordsAction,
  },
  destroySingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.DESTROY,
    label: 'Permanently destroy record',
    shortLabel: 'Destroy',
    position: 14,
    Icon: IconTrashX,
    accent: 'danger',
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    actionHook: useDestroySingleRecordAction,
  },
  exportMultipleRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: MultipleRecordsActionKeys.EXPORT,
    label: 'Export records',
    shortLabel: 'Export',
    position: 15,
    Icon: IconDatabaseExport,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_BULK_SELECTION],
    actionHook: useExportMultipleRecordsAction,
  },
  exportView: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: NoSelectionRecordActionKeys.EXPORT_VIEW,
    label: 'Export view',
    shortLabel: 'Export',
    position: 16,
    Icon: IconDatabaseExport,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    actionHook: useExportMultipleRecordsAction,
  },
};

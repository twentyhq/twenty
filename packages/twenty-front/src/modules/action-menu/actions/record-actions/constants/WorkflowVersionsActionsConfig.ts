import { useExportMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useExportMultipleRecordsAction';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { useSeeDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeDeletedRecordsNoSelectionRecordAction';
import { useSeeRunsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeRunsNoSelectionRecordAction';
import { useSeeWorkflowsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeWorkflowsNoSelectionRecordAction';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKey';
import { useAddToFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useAddToFavoritesSingleRecordAction';
import { useNavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToNextRecordSingleRecordAction';
import { useNavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToPreviousRecordSingleRecordAction';
import { useRemoveFromFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useRemoveFromFavoritesSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { useSeeRunsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeRunsWorkflowVersionSingleRecordAction';
import { useSeeVersionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeVersionsWorkflowVersionSingleRecordAction';
import { useSeeWorkflowWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeWorkflowWorkflowVersionSingleRecordAction';
import { useUseAsDraftWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useUseAsDraftWorkflowVersionSingleRecordAction';
import { WorkflowVersionSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/types/WorkflowVersionSingleRecordActionsKeys';
import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { msg } from '@lingui/core/macro';
import {
  IconChevronDown,
  IconChevronUp,
  IconDatabaseExport,
  IconHeart,
  IconHeartOff,
  IconHistory,
  IconHistoryToggle,
  IconPencil,
  IconRotate2,
  IconSettingsAutomation,
} from 'twenty-ui';

export const WORKFLOW_VERSIONS_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    useAction: ActionHook;
  }
> = {
  useAsDraftWorkflowVersionSingleRecord: {
    key: WorkflowVersionSingleRecordActionKeys.USE_AS_DRAFT,
    label: msg`Use as draft`,
    shortLabel: msg`Use as draft`,
    position: 1,
    isPinned: true,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconPencil,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useUseAsDraftWorkflowVersionSingleRecordAction,
  },
  seeWorkflowSingleRecord: {
    key: WorkflowVersionSingleRecordActionKeys.SEE_WORKFLOW,
    label: msg`See workflow`,
    shortLabel: msg`See workflow`,
    position: 2,
    isPinned: true,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconSettingsAutomation,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeWorkflowWorkflowVersionSingleRecordAction,
  },
  seeWorkflowRunsSingleRecord: {
    key: WorkflowVersionSingleRecordActionKeys.SEE_RUNS,
    label: msg`See runs`,
    shortLabel: msg`See runs`,
    position: 3,
    isPinned: true,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconHistoryToggle,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeRunsWorkflowVersionSingleRecordAction,
  },
  seeWorkflowVersionsHistorySingleRecord: {
    key: WorkflowVersionSingleRecordActionKeys.SEE_VERSIONS,
    label: msg`See versions history`,
    shortLabel: msg`See versions`,
    position: 4,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconHistory,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeVersionsWorkflowVersionSingleRecordAction,
  },
  navigateToPreviousRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    label: msg`Navigate to previous version`,
    position: 5,
    Icon: IconChevronUp,
    availableOn: [ActionViewType.SHOW_PAGE],
    useAction: useNavigateToPreviousRecordSingleRecordAction,
  },
  navigateToNextRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    label: msg`Navigate to next version`,
    position: 6,
    Icon: IconChevronDown,
    availableOn: [ActionViewType.SHOW_PAGE],
    useAction: useNavigateToNextRecordSingleRecordAction,
  },
  addToFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
    label: msg`Add to favorites`,
    shortLabel: msg`Add to favorites`,
    position: 7,
    isPinned: false,
    Icon: IconHeart,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    useAction: useAddToFavoritesSingleRecordAction,
  },
  removeFromFavoritesSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    label: msg`Remove from favorites`,
    shortLabel: msg`Remove from favorites`,
    isPinned: false,
    position: 8,
    Icon: IconHeartOff,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    useAction: useRemoveFromFavoritesSingleRecordAction,
  },
  exportSingleRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT,
    label: msg`Export version`,
    shortLabel: msg`Export`,
    position: 9,
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
    label: msg`Export versions`,
    shortLabel: msg`Export`,
    position: 10,
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
    position: 11,
    Icon: IconDatabaseExport,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useExportMultipleRecordsAction,
  },
  seeDeletedRecords: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.Object,
    key: NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
    label: msg`See deleted versions`,
    shortLabel: msg`Deleted versions`,
    position: 12,
    Icon: IconRotate2,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useSeeDeletedRecordsNoSelectionRecordAction,
  },
  seeAllWorkflows: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: NoSelectionRecordActionKeys.SEE_WORKFLOWS,
    label: msg`Go to workflows`,
    shortLabel: msg`See workflows`,
    position: 13,
    Icon: IconSettingsAutomation,
    accent: 'default',
    isPinned: true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useSeeWorkflowsNoSelectionRecordAction,
    hotKeys: ['G', 'W'],
  },
  seeAllRuns: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: NoSelectionRecordActionKeys.SEE_RUNS,
    label: msg`Go to runs`,
    shortLabel: msg`See runs`,
    position: 14,
    Icon: IconHistoryToggle,
    accent: 'default',
    isPinned: true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useSeeRunsNoSelectionRecordAction,
  },
};

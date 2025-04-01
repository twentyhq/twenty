import { DEFAULT_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultActionsConfig';
import { useSeeRunsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeRunsNoSelectionRecordAction';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKey';
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
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { msg } from '@lingui/core/macro';
import {
  IconHistoryToggle,
  IconNoteOff,
  IconPlayerPause,
  IconPlayerPlay,
  IconPower,
  IconVersions,
} from 'twenty-ui';

export const WORKFLOW_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    useAction: ActionHook;
    shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
  }
> = {
  createNewRecord: {
    ...DEFAULT_ACTIONS_CONFIG.createNewRecord,
    position: 0,
  },
  activateWorkflowSingleRecord: {
    key: WorkflowSingleRecordActionKeys.ACTIVATE,
    label: msg`Activate Workflow`,
    shortLabel: msg`Activate`,
    isPinned: true,
    position: 1,
    Icon: IconPower,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useActivateWorkflowSingleRecordAction,
  },
  deactivateWorkflowSingleRecord: {
    key: WorkflowSingleRecordActionKeys.DEACTIVATE,
    label: msg`Deactivate Workflow`,
    shortLabel: msg`Deactivate`,
    isPinned: true,
    position: 2,
    Icon: IconPlayerPause,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useDeactivateWorkflowSingleRecordAction,
  },
  discardWorkflowDraftSingleRecord: {
    key: WorkflowSingleRecordActionKeys.DISCARD_DRAFT,
    label: msg`Discard Draft`,
    shortLabel: msg`Discard Draft`,
    isPinned: true,
    position: 3,
    Icon: IconNoteOff,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useDiscardDraftWorkflowSingleRecordAction,
  },
  seeWorkflowActiveVersionSingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_ACTIVE_VERSION,
    label: msg`See active version`,
    shortLabel: msg`See active version`,
    isPinned: false,
    position: 4,
    Icon: IconVersions,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeActiveVersionWorkflowSingleRecordAction,
  },
  seeWorkflowRunsSingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_RUNS,
    label: msg`See runs`,
    shortLabel: msg`See runs`,
    isPinned: true,
    position: 5,
    Icon: IconHistoryToggle,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeRunsWorkflowSingleRecordAction,
  },
  seeWorkflowVersionsHistorySingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_VERSIONS,
    label: msg`See versions history`,
    shortLabel: msg`See versions`,
    isPinned: false,
    position: 6,
    Icon: IconVersions,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeVersionsWorkflowSingleRecordAction,
  },
  testWorkflowSingleRecord: {
    key: WorkflowSingleRecordActionKeys.TEST,
    label: msg`Test Workflow`,
    shortLabel: msg`Test`,
    isPinned: true,
    position: 7,
    Icon: IconPlayerPlay,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useTestWorkflowSingleRecordAction,
  },
  navigateToPreviousRecord: {
    ...DEFAULT_ACTIONS_CONFIG['navigateToPreviousRecord'],
    position: 8,
    label: msg`Navigate to previous workflow`,
  },
  navigateToNextRecord: {
    ...DEFAULT_ACTIONS_CONFIG['navigateToNextRecord'],
    position: 9,
    label: msg`Navigate to next workflow`,
  },
  addToFavoritesSingleRecord: {
    ...DEFAULT_ACTIONS_CONFIG['addToFavoritesSingleRecord'],
    position: 10,
  },
  removeFromFavoritesSingleRecord: {
    ...DEFAULT_ACTIONS_CONFIG['removeFromFavoritesSingleRecord'],
    position: 11,
  },
  deleteSingleRecord: {
    ...DEFAULT_ACTIONS_CONFIG['deleteSingleRecord'],
    position: 12,
    label: msg`Delete workflow`,
  },
  deleteMultipleRecords: {
    ...DEFAULT_ACTIONS_CONFIG['deleteMultipleRecords'],
    position: 13,
    label: msg`Delete workflows`,
  },
  destroySingleRecord: {
    ...DEFAULT_ACTIONS_CONFIG['destroySingleRecord'],
    position: 14,
    label: msg`Permanently destroy workflow`,
  },
  exportSingleRecord: {
    ...DEFAULT_ACTIONS_CONFIG['exportSingleRecord'],
    position: 15,
    label: msg`Export workflow`,
  },
  exportMultipleRecords: {
    ...DEFAULT_ACTIONS_CONFIG['exportMultipleRecords'],
    position: 16,
    label: msg`Export workflows`,
  },
  exportView: {
    ...DEFAULT_ACTIONS_CONFIG['exportView'],
    position: 17,
  },
  destroyMultipleRecords: {
    ...DEFAULT_ACTIONS_CONFIG['destroyMultipleRecords'],
    position: 18,
    label: msg`Permanently destroy workflows`,
  },
  seeDeletedRecords: {
    ...DEFAULT_ACTIONS_CONFIG['seeDeletedRecords'],
    position: 20,
    label: msg`See deleted workflows`,
  },
  hideDeletedRecords: {
    ...DEFAULT_ACTIONS_CONFIG['hideDeletedRecords'],
    position: 21,
    label: msg`Hide deleted workflows`,
  },
  importRecords: {
    ...DEFAULT_ACTIONS_CONFIG['importRecords'],
    position: 22,
    label: msg`Import workflows`,
  },
  seeAllRuns: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_RUNS,
    label: msg`Go to runs`,
    shortLabel: msg`See runs`,
    position: 22,
    Icon: IconHistoryToggle,
    accent: 'default',
    isPinned: true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useSeeRunsNoSelectionRecordAction,
  },
  goToPeople: {
    ...DEFAULT_ACTIONS_CONFIG['goToPeople'],
    position: 23,
  },
  goToCompanies: {
    ...DEFAULT_ACTIONS_CONFIG['goToCompanies'],
    position: 24,
  },
  goToOpportunities: {
    ...DEFAULT_ACTIONS_CONFIG['goToOpportunities'],
    position: 25,
  },
  goToSettings: {
    ...DEFAULT_ACTIONS_CONFIG['goToSettings'],
    position: 26,
  },
  goToTasks: {
    ...DEFAULT_ACTIONS_CONFIG['goToTasks'],
    position: 27,
  },
};

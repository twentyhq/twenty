import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { useSeeWorkflowsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeWorkflowsNoSelectionRecordAction';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { useSeeVersionWorkflowRunSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-run-actions/hooks/useSeeVersionWorkflowRunSingleRecordAction';
import { useSeeWorkflowWorkflowRunSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-run-actions/hooks/useSeeWorkflowWorkflowRunSingleRecordAction';
import { WorkflowRunSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-run-actions/types/WorkflowRunSingleRecordActionsKeys';
import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { msg } from '@lingui/core/macro';
import { IconSettingsAutomation, IconVersions } from 'twenty-ui';

export const WORKFLOW_RUNS_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    useAction: ActionHook;
    shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
  }
> = {
  seeWorkflowSingleRecord: {
    key: WorkflowRunSingleRecordActionKeys.SEE_WORKFLOW,
    label: msg`See workflow`,
    shortLabel: msg`See workflow`,
    position: 0,
    isPinned: true,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconSettingsAutomation,
    shouldBeRegistered: () => true,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeWorkflowWorkflowRunSingleRecordAction,
  },
  seeVersionSingleRecord: {
    key: WorkflowRunSingleRecordActionKeys.SEE_VERSION,
    label: msg`See version`,
    shortLabel: msg`See version`,
    position: 1,
    isPinned: true,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconVersions,
    shouldBeRegistered: () => true,
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeVersionWorkflowRunSingleRecordAction,
  },
  addToFavoritesSingleRecord: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.addToFavoritesSingleRecord,
    isPinned: false,
    position: 2,
  },
  removeFromFavoritesSingleRecord: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.removeFromFavoritesSingleRecord,
    isPinned: false,
    position: 3,
  },
  navigateToPreviousRecord: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.navigateToPreviousRecord,
    position: 4,
  },
  navigateToNextRecord: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.navigateToNextRecord,
    position: 5,
  },
  exportSingleRecord: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.exportSingleRecord,
    position: 6,
    label: msg`Export run`,
  },
  exportMultipleRecords: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.exportMultipleRecords,
    position: 7,
    label: msg`Export runs`,
  },
  exportView: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.exportView,
    position: 8,
    label: msg`Export view`,
  },
  seeDeletedRecords: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.seeDeletedRecords,
    position: 9,
    label: msg`See deleted runs`,
  },
  hideDeletedRecords: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.hideDeletedRecords,
    position: 10,
    label: msg`Hide deleted runs`,
  },
  seeAllWorkflows: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
    label: msg`Go to workflows`,
    shortLabel: msg`See workflows`,
    position: 11,
    Icon: IconSettingsAutomation,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useSeeWorkflowsNoSelectionRecordAction,
    hotKeys: ['G', 'W'],
  },
  goToPeople: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.goToPeople,
    position: 12,
  },
  goToCompanies: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.goToCompanies,
    position: 13,
  },
  goToOpportunities: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.goToOpportunities,
    position: 14,
  },
  goToSettings: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.goToSettings,
    position: 15,
  },
  goToTasks: {
    ...DEFAULT_RECORD_ACTIONS_CONFIG.goToTasks,
    position: 16,
  },
};

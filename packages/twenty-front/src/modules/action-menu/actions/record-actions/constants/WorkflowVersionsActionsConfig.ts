import { DEFAULT_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { useHideDeletedRecordsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useHideDeletedRecordsNoSelectionRecordAction';
import { useSeeRunsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeRunsNoSelectionRecordAction';
import { useSeeWorkflowsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeWorkflowsNoSelectionRecordAction';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { useSeeRunsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeRunsWorkflowVersionSingleRecordAction';
import { useSeeVersionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeVersionsWorkflowVersionSingleRecordAction';
import { useSeeWorkflowWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeWorkflowWorkflowVersionSingleRecordAction';
import { useUseAsDraftWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useUseAsDraftWorkflowVersionSingleRecordAction';
import { WorkflowVersionSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/types/WorkflowVersionSingleRecordActionsKeys';
import { ActionHook } from '@/action-menu/actions/types/ActionHook';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconEyeOff,
  IconHistoryToggle,
  IconPencil,
  IconSettingsAutomation,
  IconVersions,
} from 'twenty-ui';

export const WORKFLOW_VERSIONS_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    useAction: ActionHook;
    shouldBeRegistered: (params: ShouldBeRegisteredFunctionParams) => boolean;
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
    shouldBeRegistered: ({ selectedRecord }) =>
      isDefined(selectedRecord) && selectedRecord.status !== 'DRAFT',
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
    shouldBeRegistered: ({ selectedRecord }) =>
      isDefined(selectedRecord?.workflow?.id),
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
    shouldBeRegistered: ({ workflowWithCurrentVersion }) =>
      isDefined(workflowWithCurrentVersion),
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
    Icon: IconVersions,
    shouldBeRegistered: ({ workflowWithCurrentVersion }) =>
      isDefined(workflowWithCurrentVersion),
    availableOn: [
      ActionViewType.SHOW_PAGE,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    useAction: useSeeVersionsWorkflowVersionSingleRecordAction,
  },
  navigateToPreviousRecord: {
    ...DEFAULT_ACTIONS_CONFIG.navigateToPreviousRecord,
    position: 5,
  },
  navigateToNextRecord: {
    ...DEFAULT_ACTIONS_CONFIG.navigateToNextRecord,
    shouldBeRegistered: () => true,
  },

  addToFavoritesSingleRecord: {
    ...DEFAULT_ACTIONS_CONFIG.addToFavoritesSingleRecord,
    position: 7,
    isPinned: false,
  },
  removeFromFavoritesSingleRecord: {
    ...DEFAULT_ACTIONS_CONFIG.removeFromFavoritesSingleRecord,
    position: 8,
    isPinned: false,
  },
  exportSingleRecord: {
    ...DEFAULT_ACTIONS_CONFIG.exportSingleRecord,
    position: 9,
    label: msg`Export version`,
  },
  exportMultipleRecords: {
    ...DEFAULT_ACTIONS_CONFIG.exportMultipleRecords,
    position: 10,
    label: msg`Export versions`,
  },
  exportView: {
    ...DEFAULT_ACTIONS_CONFIG.exportView,
    position: 11,
  },
  seeDeletedRecords: {
    ...DEFAULT_ACTIONS_CONFIG.seeDeletedRecords,
    position: 12,
  },
  hideDeletedRecords: {
    ...DEFAULT_ACTIONS_CONFIG.hideDeletedRecords,
    position: 13,
    Icon: IconEyeOff,
    accent: 'default',
    isPinned: false,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useHideDeletedRecordsNoSelectionRecordAction,
  },
  seeAllWorkflows: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
    label: msg`Go to workflows`,
    shortLabel: msg`See workflows`,
    position: 14,
    Icon: IconSettingsAutomation,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useSeeWorkflowsNoSelectionRecordAction,
    hotKeys: ['G', 'W'],
  },
  seeAllRuns: {
    type: ActionMenuEntryType.Navigation,
    scope: ActionMenuEntryScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_RUNS,
    label: msg`Go to runs`,
    shortLabel: msg`See runs`,
    position: 15,
    Icon: IconHistoryToggle,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
    useAction: useSeeRunsNoSelectionRecordAction,
  },
  goToPeople: {
    ...DEFAULT_ACTIONS_CONFIG.goToPeople,
    position: 16,
  },
  goToCompanies: {
    ...DEFAULT_ACTIONS_CONFIG.goToCompanies,
    position: 17,
  },
  goToOpportunities: {
    ...DEFAULT_ACTIONS_CONFIG.goToOpportunities,
    position: 18,
  },
  goToSettings: {
    ...DEFAULT_ACTIONS_CONFIG.goToSettings,
    position: 19,
  },
  goToTasks: {
    ...DEFAULT_ACTIONS_CONFIG.goToTasks,
    position: 20,
  },
};

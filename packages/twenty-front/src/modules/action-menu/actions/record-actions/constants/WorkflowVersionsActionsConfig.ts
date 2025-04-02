import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { useSeeRunsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeRunsNoSelectionRecordAction';
import { useSeeWorkflowsNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useSeeWorkflowsNoSelectionRecordAction';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { NoSelectionWorkflowRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/workflow-actions/types/NoSelectionWorkflowRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { useSeeRunsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeRunsWorkflowVersionSingleRecordAction';
import { useSeeVersionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeVersionsWorkflowVersionSingleRecordAction';
import { useSeeWorkflowWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeWorkflowWorkflowVersionSingleRecordAction';
import { useUseAsDraftWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useUseAsDraftWorkflowVersionSingleRecordAction';
import { WorkflowVersionSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/types/WorkflowVersionSingleRecordActionsKeys';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconHistoryToggle,
  IconPencil,
  IconSettingsAutomation,
  IconVersions,
} from 'twenty-ui';

export const WORKFLOW_VERSIONS_ACTIONS_CONFIG = inheritActionsFromDefaultConfig(
  {
    config: {
      [WorkflowVersionSingleRecordActionKeys.USE_AS_DRAFT]: {
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
      [WorkflowVersionSingleRecordActionKeys.SEE_WORKFLOW]: {
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
      [WorkflowVersionSingleRecordActionKeys.SEE_RUNS]: {
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
      [WorkflowVersionSingleRecordActionKeys.SEE_VERSIONS]: {
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
      [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
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
      [NoSelectionWorkflowRecordActionKeys.GO_TO_RUNS]: {
        type: ActionMenuEntryType.Navigation,
        scope: ActionMenuEntryScope.Global,
        key: NoSelectionWorkflowRecordActionKeys.GO_TO_RUNS,
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
    },
    actionKeys: [
      SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
      SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
      SingleRecordActionKeys.ADD_TO_FAVORITES,
      SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
      SingleRecordActionKeys.EXPORT,
      MultipleRecordsActionKeys.EXPORT,
      NoSelectionRecordActionKeys.EXPORT_VIEW,
      NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
      NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS,
      NoSelectionRecordActionKeys.GO_TO_PEOPLE,
      NoSelectionRecordActionKeys.GO_TO_COMPANIES,
      NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
      NoSelectionRecordActionKeys.GO_TO_SETTINGS,
      NoSelectionRecordActionKeys.GO_TO_TASKS,
    ],
    propertiesToOverwrite: {
      [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
        position: 5,
        isPinned: false,
      },
      [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
        position: 6,
        isPinned: false,
      },
      [SingleRecordActionKeys.EXPORT]: {
        position: 7,
        label: msg`Export version`,
      },
      [MultipleRecordsActionKeys.EXPORT]: {
        position: 8,
        label: msg`Export versions`,
      },
      [NoSelectionRecordActionKeys.EXPORT_VIEW]: {
        position: 9,
      },
      [NoSelectionRecordActionKeys.SEE_DELETED_RECORDS]: {
        position: 10,
      },
      [NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS]: {
        position: 11,
      },
      [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 12,
        label: msg`Navigate to previous version`,
      },
      [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 13,
        label: msg`Navigate to next version`,
      },
      [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
        position: 16,
      },
      [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
        position: 17,
      },
      [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
        position: 18,
      },
      [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
        position: 19,
      },
      [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
        position: 20,
      },
    },
  },
);

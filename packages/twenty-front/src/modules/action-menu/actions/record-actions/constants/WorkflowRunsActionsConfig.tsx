import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { SeeVersionWorkflowRunSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-run-actions/components/SeeVersionWorkflowRunSingleRecordAction';
import { SeeWorkflowWorkflowRunSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-run-actions/components/SeeWorkflowWorkflowRunSingleRecordAction';
import { WorkflowRunSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-run-actions/types/WorkflowRunSingleRecordActionsKeys';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { msg } from '@lingui/core/macro';
import { IconSettingsAutomation, IconVersions } from 'twenty-ui/display';

export const WORKFLOW_RUNS_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [WorkflowRunSingleRecordActionKeys.SEE_WORKFLOW]: {
      key: WorkflowRunSingleRecordActionKeys.SEE_WORKFLOW,
      label: msg`See workflow`,
      shortLabel: msg`See workflow`,
      position: 0,
      isPinned: true,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      Icon: IconSettingsAutomation,
      shouldBeRegistered: () => true,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <SeeWorkflowWorkflowRunSingleRecordAction />,
    },
    [WorkflowRunSingleRecordActionKeys.SEE_VERSION]: {
      key: WorkflowRunSingleRecordActionKeys.SEE_VERSION,
      label: msg`See version`,
      shortLabel: msg`See version`,
      position: 1,
      isPinned: true,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      Icon: IconVersions,
      shouldBeRegistered: () => true,
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <SeeVersionWorkflowRunSingleRecordAction />,
    },
  },
  actionKeys: [
    SingleRecordActionKeys.ADD_TO_FAVORITES,
    SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX,
    SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW,
    MultipleRecordsActionKeys.EXPORT,
    NoSelectionRecordActionKeys.EXPORT_VIEW,
    NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
    NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS,
    NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
    NoSelectionRecordActionKeys.GO_TO_PEOPLE,
    NoSelectionRecordActionKeys.GO_TO_COMPANIES,
    NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
    NoSelectionRecordActionKeys.GO_TO_SETTINGS,
    NoSelectionRecordActionKeys.GO_TO_TASKS,
    NoSelectionRecordActionKeys.GO_TO_NOTES,
  ],
  propertiesToOverwrite: {
    [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
      isPinned: false,
      position: 2,
    },
    [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
      isPinned: false,
      position: 3,
    },
    [SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX]: {
      position: 4,
      label: msg`Export run`,
    },
    [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
      position: 4,
      label: msg`Export run`,
    },
    [MultipleRecordsActionKeys.EXPORT]: {
      position: 5,
      label: msg`Export runs`,
    },
    [NoSelectionRecordActionKeys.EXPORT_VIEW]: {
      position: 6,
      label: msg`Export view`,
    },
    [NoSelectionRecordActionKeys.SEE_DELETED_RECORDS]: {
      position: 7,
      label: msg`See deleted runs`,
    },
    [NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS]: {
      position: 8,
      label: msg`Hide deleted runs`,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
      position: 9,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
      position: 10,
    },
    [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
      position: 11,
      isPinned: true,
    },
    [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
      position: 12,
    },
    [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
      position: 13,
    },
    [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
      position: 14,
    },
    [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
      position: 15,
    },
    [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
      position: 16,
    },
    [NoSelectionRecordActionKeys.GO_TO_NOTES]: {
      position: 17,
    },
  },
});

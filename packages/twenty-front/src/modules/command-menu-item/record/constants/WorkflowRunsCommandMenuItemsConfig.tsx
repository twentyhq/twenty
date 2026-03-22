import { MultipleRecordsCommandKeys } from '@/command-menu-item/record/multiple-records/types/MultipleRecordsCommandKeys';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { SeeVersionWorkflowRunSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-runs/components/SeeVersionWorkflowRunSingleRecordCommand';
import { SeeWorkflowWorkflowRunSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-runs/components/SeeWorkflowWorkflowRunSingleRecordCommand';
import { StopWorkflowRunSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-runs/components/StopWorkflowRunSingleRecordCommand';
import { WorkflowRunSingleRecordCommandKeys } from '@/command-menu-item/record/single-record/workflow-runs/types/WorkflowRunSingleRecordCommandKeys';
import { inheritCommandMenuItemsFromDefaultConfig } from '@/command-menu-item/record/utils/inheritCommandMenuItemsFromDefaultConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuItemViewType } from 'twenty-shared/types';
import { msg } from '@lingui/core/macro';
import {
  IconPlayerStop,
  IconSettingsAutomation,
  IconVersions,
} from 'twenty-ui/display';

export const WORKFLOW_RUNS_COMMAND_MENU_ITEMS_CONFIG =
  inheritCommandMenuItemsFromDefaultConfig({
    config: {
      [WorkflowRunSingleRecordCommandKeys.SEE_VERSION]: {
        key: WorkflowRunSingleRecordCommandKeys.SEE_VERSION,
        label: msg`See version`,
        shortLabel: msg`See version`,
        position: 0,
        isPinned: true,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        Icon: IconVersions,
        shouldBeRegistered: () => true,
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeVersionWorkflowRunSingleRecordCommand />,
      },

      [WorkflowRunSingleRecordCommandKeys.SEE_WORKFLOW]: {
        key: WorkflowRunSingleRecordCommandKeys.SEE_WORKFLOW,
        label: msg`See workflow`,
        shortLabel: msg`See workflow`,
        position: 1,
        isPinned: true,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        Icon: IconSettingsAutomation,
        shouldBeRegistered: () => true,
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeWorkflowWorkflowRunSingleRecordCommand />,
      },
      [WorkflowRunSingleRecordCommandKeys.STOP]: {
        key: WorkflowRunSingleRecordCommandKeys.STOP,
        label: msg`Stop`,
        shortLabel: msg`Stop`,
        position: 2,
        isPinned: true,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        Icon: IconPlayerStop,
        shouldBeRegistered: ({ selectedRecord, isSelectAll }) => {
          if (isSelectAll === true) {
            return true;
          }

          const stoppableStatuses = ['NOT_STARTED', 'ENQUEUED', 'RUNNING'];
          return stoppableStatuses.includes(selectedRecord?.status);
        },
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
          CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
        ],
        component: <StopWorkflowRunSingleRecordCommand />,
      },
    },
    commandKeys: [
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
      SingleRecordCommandKeys.REMOVE_FROM_FAVORITES,
      SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD,
      SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD,
      SingleRecordCommandKeys.EXPORT_FROM_RECORD_INDEX,
      SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW,
      MultipleRecordsCommandKeys.EXPORT,
      NoSelectionRecordCommandKeys.EXPORT_VIEW,
      NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS,
      NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS,
      NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS,
      NoSelectionRecordCommandKeys.GO_TO_PEOPLE,
      NoSelectionRecordCommandKeys.GO_TO_COMPANIES,
      NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES,
      NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS,
      NoSelectionRecordCommandKeys.GO_TO_SETTINGS,
      NoSelectionRecordCommandKeys.GO_TO_TASKS,
      NoSelectionRecordCommandKeys.GO_TO_NOTES,
    ],
    propertiesToOverwrite: {
      [SingleRecordCommandKeys.ADD_TO_FAVORITES]: {
        isPinned: false,
        position: 3,
      },
      [SingleRecordCommandKeys.REMOVE_FROM_FAVORITES]: {
        isPinned: false,
        position: 4,
      },
      [SingleRecordCommandKeys.EXPORT_FROM_RECORD_INDEX]: {
        position: 5,
        label: msg`Export run`,
      },
      [SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW]: {
        position: 5,
        label: msg`Export run`,
      },
      [MultipleRecordsCommandKeys.EXPORT]: {
        position: 6,
        label: msg`Export runs`,
      },
      [NoSelectionRecordCommandKeys.EXPORT_VIEW]: {
        position: 7,
        label: msg`Export view`,
      },
      [NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS]: {
        position: 8,
        label: msg`See deleted runs`,
      },
      [NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS]: {
        position: 9,
        label: msg`Hide deleted runs`,
      },
      [SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 10,
      },
      [SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 11,
      },
      [NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS]: {
        position: 12,
        isPinned: true,
      },
      [NoSelectionRecordCommandKeys.GO_TO_PEOPLE]: {
        position: 13,
      },
      [NoSelectionRecordCommandKeys.GO_TO_COMPANIES]: {
        position: 14,
      },
      [NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES]: {
        position: 15,
      },
      [NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS]: {
        position: 16,
      },
      [NoSelectionRecordCommandKeys.GO_TO_SETTINGS]: {
        position: 17,
      },
      [NoSelectionRecordCommandKeys.GO_TO_TASKS]: {
        position: 18,
      },
      [NoSelectionRecordCommandKeys.GO_TO_NOTES]: {
        position: 19,
      },
    },
  });

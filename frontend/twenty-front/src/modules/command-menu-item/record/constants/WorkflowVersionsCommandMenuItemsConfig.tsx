import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { MultipleRecordsCommandKeys } from '@/command-menu-item/record/multiple-records/types/MultipleRecordsCommandKeys';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { NoSelectionWorkflowRecordCommandKeys } from '@/command-menu-item/record/no-selection/workflow/types/NoSelectionWorkflowRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { SeeRunsWorkflowVersionSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-versions/components/SeeRunsWorkflowVersionSingleRecordCommand';
import { SeeVersionsWorkflowVersionSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-versions/components/SeeVersionsWorkflowVersionSingleRecordCommand';
import { SeeWorkflowWorkflowVersionSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-versions/components/SeeWorkflowWorkflowVersionSingleRecordCommand';
import { UseAsDraftWorkflowVersionSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-versions/components/UseAsDraftWorkflowVersionSingleRecordCommand';
import { WorkflowVersionSingleRecordCommandKeys } from '@/command-menu-item/record/single-record/workflow-versions/types/WorkflowVersionSingleRecordCommandKeys';
import { inheritCommandMenuItemsFromDefaultConfig } from '@/command-menu-item/record/utils/inheritCommandMenuItemsFromDefaultConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuItemViewType, AppPath } from 'twenty-shared/types';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconHistoryToggle,
  IconPencil,
  IconSettingsAutomation,
  IconVersions,
} from 'twenty-ui/display';

export const WORKFLOW_VERSIONS_COMMAND_MENU_ITEMS_CONFIG =
  inheritCommandMenuItemsFromDefaultConfig({
    config: {
      [WorkflowVersionSingleRecordCommandKeys.SEE_RUNS]: {
        key: WorkflowVersionSingleRecordCommandKeys.SEE_RUNS,
        label: msg`See runs`,
        shortLabel: msg`See runs`,
        position: 1,
        isPinned: true,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        Icon: IconHistoryToggle,
        shouldBeRegistered: ({ workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeRunsWorkflowVersionSingleRecordCommand />,
      },
      [WorkflowVersionSingleRecordCommandKeys.SEE_WORKFLOW]: {
        key: WorkflowVersionSingleRecordCommandKeys.SEE_WORKFLOW,
        label: msg`See workflow`,
        shortLabel: msg`See workflow`,
        position: 2,
        isPinned: true,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        Icon: IconSettingsAutomation,
        shouldBeRegistered: ({ selectedRecord }) =>
          isDefined(selectedRecord?.workflow?.id),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeWorkflowWorkflowVersionSingleRecordCommand />,
      },
      [WorkflowVersionSingleRecordCommandKeys.USE_AS_DRAFT]: {
        key: WorkflowVersionSingleRecordCommandKeys.USE_AS_DRAFT,
        label: msg`Use as draft`,
        shortLabel: msg`Use as draft`,
        position: 3,
        isPinned: true,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        Icon: IconPencil,
        shouldBeRegistered: ({ selectedRecord }) =>
          isDefined(selectedRecord) && selectedRecord.status !== 'DRAFT',
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <UseAsDraftWorkflowVersionSingleRecordCommand />,
      },
      [WorkflowVersionSingleRecordCommandKeys.SEE_VERSIONS]: {
        key: WorkflowVersionSingleRecordCommandKeys.SEE_VERSIONS,
        label: msg`See versions history`,
        shortLabel: msg`See versions`,
        position: 4,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        Icon: IconVersions,
        shouldBeRegistered: ({ workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeVersionsWorkflowVersionSingleRecordCommand />,
      },
      [NoSelectionWorkflowRecordCommandKeys.GO_TO_RUNS]: {
        type: CommandMenuItemType.Navigation,
        scope: CommandMenuItemScope.Global,
        key: NoSelectionWorkflowRecordCommandKeys.GO_TO_RUNS,
        label: msg`Go to runs`,
        shortLabel: msg`See runs`,
        position: 14,
        Icon: IconHistoryToggle,
        accent: 'default',
        isPinned: true,
        shouldBeRegistered: () => true,
        availableOn: [CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION],
        component: (
          <CommandLink
            to={AppPath.RecordIndexPage}
            params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
          />
        ),
      },
    },
    commandKeys: [
      SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD,
      SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD,
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
      SingleRecordCommandKeys.REMOVE_FROM_FAVORITES,
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
        position: 5,
        isPinned: false,
      },
      [SingleRecordCommandKeys.REMOVE_FROM_FAVORITES]: {
        position: 6,
        isPinned: false,
      },
      [SingleRecordCommandKeys.EXPORT_FROM_RECORD_INDEX]: {
        position: 7,
        label: msg`Export version`,
      },
      [SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW]: {
        position: 7,
        label: msg`Export version`,
      },
      [MultipleRecordsCommandKeys.EXPORT]: {
        position: 8,
        label: msg`Export versions`,
      },
      [NoSelectionRecordCommandKeys.EXPORT_VIEW]: {
        position: 9,
      },
      [NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS]: {
        position: 10,
      },
      [NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS]: {
        position: 11,
      },
      [SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 12,
        label: msg`Navigate to previous version`,
      },
      [SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 13,
        label: msg`Navigate to next version`,
      },
      [NoSelectionRecordCommandKeys.GO_TO_WORKFLOWS]: {
        position: 15,
        isPinned: true,
      },
      [NoSelectionRecordCommandKeys.GO_TO_PEOPLE]: {
        position: 16,
      },
      [NoSelectionRecordCommandKeys.GO_TO_COMPANIES]: {
        position: 17,
      },
      [NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES]: {
        position: 18,
      },
      [NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS]: {
        position: 19,
      },
      [NoSelectionRecordCommandKeys.GO_TO_SETTINGS]: {
        position: 20,
      },
      [NoSelectionRecordCommandKeys.GO_TO_TASKS]: {
        position: 21,
      },
      [NoSelectionRecordCommandKeys.GO_TO_NOTES]: {
        position: 22,
      },
    },
  });

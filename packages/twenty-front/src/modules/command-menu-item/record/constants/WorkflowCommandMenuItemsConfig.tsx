import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { MultipleRecordsCommandKeys } from '@/command-menu-item/record/multiple-records/types/MultipleRecordsCommandKeys';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { NoSelectionWorkflowRecordCommandKeys } from '@/command-menu-item/record/no-selection/workflow/types/NoSelectionWorkflowRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { ActivateWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/ActivateWorkflowSingleRecordCommand';
import { AddNodeWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/AddNodeWorkflowSingleRecordCommand';
import { DeactivateWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/DeactivateWorkflowSingleRecordCommand';
import { DiscardDraftWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/DiscardDraftWorkflowSingleRecordCommand';
import { DuplicateWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/DuplicateWorkflowSingleRecordCommand';
import { SeeActiveVersionWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/SeeActiveVersionWorkflowSingleRecordCommand';
import { SeeRunsWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/SeeRunsWorkflowSingleRecordCommand';
import { SeeVersionsWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/SeeVersionsWorkflowSingleRecordCommand';
import { TestWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/TestWorkflowSingleRecordCommand';
import { TidyUpWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/TidyUpWorkflowSingleRecordCommand';
import { WorkflowSingleRecordCommandKeys } from '@/command-menu-item/record/single-record/workflow/types/WorkflowSingleRecordCommandKeys';
import { inheritCommandMenuItemsFromDefaultConfig } from '@/command-menu-item/record/utils/inheritCommandMenuItemsFromDefaultConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuItemViewType, AppPath } from 'twenty-shared/types';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import {
  type WorkflowStep,
  type WorkflowTrigger,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCopy,
  IconHistoryToggle,
  IconNoteOff,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconPower,
  IconReorder,
  IconVersions,
} from 'twenty-ui/display';

const areWorkflowTriggerAndStepsDefined = (
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined,
): workflowWithCurrentVersion is WorkflowWithCurrentVersion & {
  currentVersion: {
    trigger: WorkflowTrigger;
    steps: Array<WorkflowStep>;
  };
} => {
  return (
    isDefined(workflowWithCurrentVersion?.currentVersion?.trigger) &&
    isDefined(workflowWithCurrentVersion.currentVersion?.steps) &&
    workflowWithCurrentVersion.currentVersion.steps.length > 0
  );
};

export const WORKFLOW_COMMAND_MENU_ITEMS_CONFIG =
  inheritCommandMenuItemsFromDefaultConfig({
    config: {
      [WorkflowSingleRecordCommandKeys.ACTIVATE]: {
        key: WorkflowSingleRecordCommandKeys.ACTIVATE,
        label: msg`Activate Workflow`,
        shortLabel: msg`Activate`,
        isPinned: true,
        isPrimaryCTA: true,
        position: 3,
        Icon: IconPower,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          areWorkflowTriggerAndStepsDefined(workflowWithCurrentVersion) &&
          (workflowWithCurrentVersion.currentVersion.status === 'DRAFT' ||
            !workflowWithCurrentVersion.versions?.some(
              (version) => version.status === 'ACTIVE',
            )) &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <ActivateWorkflowSingleRecordCommand />,
      },
      [WorkflowSingleRecordCommandKeys.DEACTIVATE]: {
        key: WorkflowSingleRecordCommandKeys.DEACTIVATE,
        label: msg`Deactivate Workflow`,
        shortLabel: msg`Deactivate`,
        isPinned: true,
        position: 4,
        Icon: IconPlayerPause,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion) &&
          workflowWithCurrentVersion.currentVersion.status === 'ACTIVE' &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <DeactivateWorkflowSingleRecordCommand />,
      },
      [WorkflowSingleRecordCommandKeys.DISCARD_DRAFT]: {
        key: WorkflowSingleRecordCommandKeys.DISCARD_DRAFT,
        label: msg`Discard Draft`,
        shortLabel: msg`Discard Draft`,
        isPinned: true,
        position: 5,
        Icon: IconNoteOff,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion) &&
          workflowWithCurrentVersion.versions.length > 1 &&
          workflowWithCurrentVersion.currentVersion.status === 'DRAFT' &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <DiscardDraftWorkflowSingleRecordCommand />,
      },
      [WorkflowSingleRecordCommandKeys.TEST]: {
        key: WorkflowSingleRecordCommandKeys.TEST,
        label: msg`Test Workflow`,
        shortLabel: msg`Test`,
        isPinned: true,
        position: 6,
        Icon: IconPlayerPlay,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          areWorkflowTriggerAndStepsDefined(workflowWithCurrentVersion) &&
          ((workflowWithCurrentVersion.currentVersion.trigger.type ===
            'MANUAL' &&
            !isDefined(
              workflowWithCurrentVersion.currentVersion.trigger.settings
                .objectType,
            )) ||
            workflowWithCurrentVersion.currentVersion.trigger.type ===
              'WEBHOOK' ||
            workflowWithCurrentVersion.currentVersion.trigger.type ===
              'CRON') &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <TestWorkflowSingleRecordCommand />,
      },

      [WorkflowSingleRecordCommandKeys.SEE_ACTIVE_VERSION]: {
        key: WorkflowSingleRecordCommandKeys.SEE_ACTIVE_VERSION,
        label: msg`See active version`,
        shortLabel: msg`See active version`,
        isPinned: false,
        position: 7,
        Icon: IconVersions,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ workflowWithCurrentVersion, selectedRecord }) =>
          (workflowWithCurrentVersion?.statuses?.includes('ACTIVE') || false) &&
          (workflowWithCurrentVersion?.statuses?.includes('DRAFT') || false) &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeActiveVersionWorkflowSingleRecordCommand />,
      },
      [WorkflowSingleRecordCommandKeys.SEE_RUNS]: {
        key: WorkflowSingleRecordCommandKeys.SEE_RUNS,
        label: msg`See runs`,
        shortLabel: msg`See runs`,
        isPinned: true,
        position: 8,
        Icon: IconHistoryToggle,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion) &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeRunsWorkflowSingleRecordCommand />,
      },
      [WorkflowSingleRecordCommandKeys.SEE_VERSIONS]: {
        key: WorkflowSingleRecordCommandKeys.SEE_VERSIONS,
        label: msg`See versions history`,
        shortLabel: msg`See versions`,
        isPinned: false,
        position: 9,
        Icon: IconVersions,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion) &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeVersionsWorkflowSingleRecordCommand />,
      },

      [WorkflowSingleRecordCommandKeys.ADD_NODE]: {
        key: WorkflowSingleRecordCommandKeys.ADD_NODE,
        label: msg`Add a node`,
        shortLabel: msg`Add a node`,
        isPinned: true,
        position: 10,
        Icon: IconPlus,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          areWorkflowTriggerAndStepsDefined(workflowWithCurrentVersion) &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [CommandMenuItemViewType.SHOW_PAGE],
        component: <AddNodeWorkflowSingleRecordCommand />,
      },
      [WorkflowSingleRecordCommandKeys.TIDY_UP]: {
        key: WorkflowSingleRecordCommandKeys.TIDY_UP,
        label: msg`Tidy up workflow`,
        shortLabel: msg`Tidy up`,
        isPinned: false,
        position: 11,
        Icon: IconReorder,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          areWorkflowTriggerAndStepsDefined(workflowWithCurrentVersion) &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [CommandMenuItemViewType.SHOW_PAGE],
        component: <TidyUpWorkflowSingleRecordCommand />,
      },
      [WorkflowSingleRecordCommandKeys.DUPLICATE_WORKFLOW]: {
        key: WorkflowSingleRecordCommandKeys.DUPLICATE_WORKFLOW,
        label: msg`Duplicate Workflow`,
        shortLabel: msg`Duplicate`,
        isPinned: false,
        position: 12,
        Icon: IconCopy,
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.RecordSelection,
        shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion) &&
          isDefined(workflowWithCurrentVersion.currentVersion) &&
          !isDefined(selectedRecord?.deletedAt),
        availableOn: [
          CommandMenuItemViewType.SHOW_PAGE,
          CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <DuplicateWorkflowSingleRecordCommand />,
      },
      [NoSelectionWorkflowRecordCommandKeys.GO_TO_RUNS]: {
        type: CommandMenuItemType.Navigation,
        scope: CommandMenuItemScope.Global,
        key: NoSelectionWorkflowRecordCommandKeys.GO_TO_RUNS,
        label: msg`Go to runs`,
        shortLabel: msg`See runs`,
        position: 22,
        Icon: IconHistoryToggle,
        accent: 'default',
        isPinned: true,
        shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
          !hasAnySoftDeleteFilterOnView,
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
      NoSelectionRecordCommandKeys.CREATE_NEW_RECORD,
      SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD,
      SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD,
      SingleRecordCommandKeys.ADD_TO_FAVORITES,
      SingleRecordCommandKeys.REMOVE_FROM_FAVORITES,
      SingleRecordCommandKeys.DELETE,
      SingleRecordCommandKeys.DESTROY,
      SingleRecordCommandKeys.RESTORE,
      SingleRecordCommandKeys.EXPORT_FROM_RECORD_INDEX,
      SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW,
      MultipleRecordsCommandKeys.DELETE,
      MultipleRecordsCommandKeys.DESTROY,
      MultipleRecordsCommandKeys.RESTORE,
      MultipleRecordsCommandKeys.EXPORT,
      NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS,
      NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS,
      NoSelectionRecordCommandKeys.GO_TO_PEOPLE,
      NoSelectionRecordCommandKeys.GO_TO_COMPANIES,
      NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES,
      NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS,
      NoSelectionRecordCommandKeys.GO_TO_SETTINGS,
      NoSelectionRecordCommandKeys.GO_TO_TASKS,
      NoSelectionRecordCommandKeys.GO_TO_NOTES,
    ],
    propertiesToOverwrite: {
      [SingleRecordCommandKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 0,
        label: msg`Navigate to next workflow`,
      },
      [SingleRecordCommandKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 1,
        label: msg`Navigate to previous workflow`,
      },
      [NoSelectionRecordCommandKeys.CREATE_NEW_RECORD]: {
        position: 2,
        label: msg`Create new workflow`,
      },
      [SingleRecordCommandKeys.DELETE]: {
        position: 12,
        label: msg`Delete workflow`,
      },
      [MultipleRecordsCommandKeys.DELETE]: {
        position: 13,
        label: msg`Delete workflows`,
      },
      [SingleRecordCommandKeys.ADD_TO_FAVORITES]: {
        position: 14,
        isPinned: false,
      },
      [SingleRecordCommandKeys.REMOVE_FROM_FAVORITES]: {
        position: 15,
        isPinned: false,
      },
      [SingleRecordCommandKeys.DESTROY]: {
        position: 16,
        label: msg`Permanently destroy workflow`,
      },
      [SingleRecordCommandKeys.EXPORT_FROM_RECORD_INDEX]: {
        position: 17,
        label: msg`Export workflow`,
        shouldBeRegistered: ({ selectedRecord }) =>
          !isDefined(selectedRecord?.deletedAt),
      },
      [SingleRecordCommandKeys.EXPORT_FROM_RECORD_SHOW]: {
        position: 18,
        label: msg`Export workflow`,
      },
      [MultipleRecordsCommandKeys.EXPORT]: {
        position: 19,
        label: msg`Export workflows`,
      },
      [NoSelectionRecordCommandKeys.EXPORT_VIEW]: {
        position: 20,
        label: msg`Export view`,
      },
      [MultipleRecordsCommandKeys.DESTROY]: {
        position: 21,
        label: msg`Permanently destroy workflows`,
      },
      [NoSelectionRecordCommandKeys.SEE_DELETED_RECORDS]: {
        position: 22,
        label: msg`See deleted workflows`,
      },
      [NoSelectionRecordCommandKeys.HIDE_DELETED_RECORDS]: {
        position: 23,
        label: msg`Hide deleted workflows`,
      },
      [NoSelectionRecordCommandKeys.IMPORT_RECORDS]: {
        position: 24,
        label: msg`Import workflows`,
      },
      [NoSelectionRecordCommandKeys.GO_TO_PEOPLE]: {
        position: 25,
      },
      [NoSelectionRecordCommandKeys.GO_TO_COMPANIES]: {
        position: 26,
      },
      [NoSelectionRecordCommandKeys.GO_TO_OPPORTUNITIES]: {
        position: 27,
      },
      [NoSelectionRecordCommandKeys.GO_TO_DASHBOARDS]: {
        position: 28,
      },
      [NoSelectionRecordCommandKeys.GO_TO_SETTINGS]: {
        position: 29,
      },
      [NoSelectionRecordCommandKeys.GO_TO_TASKS]: {
        position: 30,
      },
      [NoSelectionRecordCommandKeys.GO_TO_NOTES]: {
        position: 31,
      },
    },
  });

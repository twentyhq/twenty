import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { NoSelectionWorkflowRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/workflow-actions/types/NoSelectionWorkflowRecordActionKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/ActivateWorkflowSingleRecordAction';
import { AddNodeWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/AddNodeWorkflowSingleRecordAction';
import { DeactivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/DeactivateWorkflowSingleRecordAction';
import { DiscardDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/DiscardDraftWorkflowSingleRecordAction';
import { SeeActiveVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/SeeActiveVersionWorkflowSingleRecordAction';
import { SeeRunsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/SeeRunsWorkflowSingleRecordAction';
import { SeeVersionsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/SeeVersionsWorkflowSingleRecordAction';
import { TestWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/TestWorkflowSingleRecordAction';
import { TidyUpWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/components/TidyUpWorkflowSingleRecordAction';
import { WorkflowSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-actions/types/WorkflowSingleRecordActionsKeys';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import {
  type WorkflowStep,
  type WorkflowTrigger,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { msg } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
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

export const WORKFLOW_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [WorkflowSingleRecordActionKeys.ACTIVATE]: {
      key: WorkflowSingleRecordActionKeys.ACTIVATE,
      label: msg`Activate Workflow`,
      shortLabel: msg`Activate`,
      isPinned: true,
      position: 1,
      Icon: IconPower,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
        areWorkflowTriggerAndStepsDefined(workflowWithCurrentVersion) &&
        (workflowWithCurrentVersion.currentVersion.status === 'DRAFT' ||
          !workflowWithCurrentVersion.versions?.some(
            (version) => version.status === 'ACTIVE',
          )) &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <ActivateWorkflowSingleRecordAction />,
    },
    [WorkflowSingleRecordActionKeys.DEACTIVATE]: {
      key: WorkflowSingleRecordActionKeys.DEACTIVATE,
      label: msg`Deactivate Workflow`,
      shortLabel: msg`Deactivate`,
      isPinned: true,
      position: 2,
      Icon: IconPlayerPause,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
        isDefined(workflowWithCurrentVersion) &&
        workflowWithCurrentVersion.currentVersion.status === 'ACTIVE' &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <DeactivateWorkflowSingleRecordAction />,
    },
    [WorkflowSingleRecordActionKeys.DISCARD_DRAFT]: {
      key: WorkflowSingleRecordActionKeys.DISCARD_DRAFT,
      label: msg`Discard Draft`,
      shortLabel: msg`Discard Draft`,
      isPinned: true,
      position: 3,
      Icon: IconNoteOff,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
        isDefined(workflowWithCurrentVersion) &&
        workflowWithCurrentVersion.versions.length > 1 &&
        workflowWithCurrentVersion.currentVersion.status === 'DRAFT' &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <DiscardDraftWorkflowSingleRecordAction />,
    },
    [WorkflowSingleRecordActionKeys.SEE_ACTIVE_VERSION]: {
      key: WorkflowSingleRecordActionKeys.SEE_ACTIVE_VERSION,
      label: msg`See active version`,
      shortLabel: msg`See active version`,
      isPinned: false,
      position: 4,
      Icon: IconVersions,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ workflowWithCurrentVersion, selectedRecord }) =>
        (workflowWithCurrentVersion?.statuses?.includes('ACTIVE') || false) &&
        (workflowWithCurrentVersion?.statuses?.includes('DRAFT') || false) &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <SeeActiveVersionWorkflowSingleRecordAction />,
    },
    [WorkflowSingleRecordActionKeys.SEE_RUNS]: {
      key: WorkflowSingleRecordActionKeys.SEE_RUNS,
      label: msg`See runs`,
      shortLabel: msg`See runs`,
      isPinned: true,
      position: 5,
      Icon: IconHistoryToggle,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
        isDefined(workflowWithCurrentVersion) &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <SeeRunsWorkflowSingleRecordAction />,
    },
    [WorkflowSingleRecordActionKeys.SEE_VERSIONS]: {
      key: WorkflowSingleRecordActionKeys.SEE_VERSIONS,
      label: msg`See versions history`,
      shortLabel: msg`See versions`,
      isPinned: false,
      position: 6,
      Icon: IconVersions,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
        isDefined(workflowWithCurrentVersion) &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <SeeVersionsWorkflowSingleRecordAction />,
    },
    [WorkflowSingleRecordActionKeys.TEST]: {
      key: WorkflowSingleRecordActionKeys.TEST,
      label: msg`Test Workflow`,
      shortLabel: msg`Test`,
      isPinned: true,
      position: 7,
      Icon: IconPlayerPlay,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
        areWorkflowTriggerAndStepsDefined(workflowWithCurrentVersion) &&
        ((workflowWithCurrentVersion.currentVersion.trigger.type === 'MANUAL' &&
          !isDefined(
            workflowWithCurrentVersion.currentVersion.trigger.settings
              .objectType,
          )) ||
          workflowWithCurrentVersion.currentVersion.trigger.type ===
            'WEBHOOK' ||
          workflowWithCurrentVersion.currentVersion.trigger.type === 'CRON') &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [
        ActionViewType.SHOW_PAGE,
        ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ],
      component: <TestWorkflowSingleRecordAction />,
    },
    [WorkflowSingleRecordActionKeys.ADD_NODE]: {
      key: WorkflowSingleRecordActionKeys.ADD_NODE,
      label: msg`Add a node`,
      shortLabel: msg`Add a node`,
      isPinned: false,
      position: 8,
      Icon: IconPlus,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
        areWorkflowTriggerAndStepsDefined(workflowWithCurrentVersion) &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <AddNodeWorkflowSingleRecordAction />,
    },
    [WorkflowSingleRecordActionKeys.TIDY_UP]: {
      key: WorkflowSingleRecordActionKeys.TIDY_UP,
      label: msg`Tidy up workflow`,
      shortLabel: msg`Tidy up`,
      isPinned: false,
      position: 9,
      Icon: IconReorder,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord, workflowWithCurrentVersion }) =>
        areWorkflowTriggerAndStepsDefined(workflowWithCurrentVersion) &&
        !isDefined(selectedRecord?.deletedAt),
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <TidyUpWorkflowSingleRecordAction />,
    },
    [NoSelectionWorkflowRecordActionKeys.GO_TO_RUNS]: {
      type: ActionType.Navigation,
      scope: ActionScope.Global,
      key: NoSelectionWorkflowRecordActionKeys.GO_TO_RUNS,
      label: msg`Go to runs`,
      shortLabel: msg`See runs`,
      position: 22,
      Icon: IconHistoryToggle,
      accent: 'default',
      isPinned: true,
      shouldBeRegistered: ({ hasAnySoftDeleteFilterOnView }) =>
        !hasAnySoftDeleteFilterOnView,
      availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
      component: (
        <ActionLink
          to={AppPath.RecordIndexPage}
          params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
        />
      ),
    },
  },
  actionKeys: [
    NoSelectionRecordActionKeys.CREATE_NEW_RECORD,
    SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    SingleRecordActionKeys.ADD_TO_FAVORITES,
    SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
    SingleRecordActionKeys.DELETE,
    SingleRecordActionKeys.DESTROY,
    SingleRecordActionKeys.RESTORE,
    SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX,
    SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW,
    MultipleRecordsActionKeys.DELETE,
    MultipleRecordsActionKeys.DESTROY,
    MultipleRecordsActionKeys.RESTORE,
    MultipleRecordsActionKeys.EXPORT,
    NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
    NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS,
    NoSelectionRecordActionKeys.GO_TO_PEOPLE,
    NoSelectionRecordActionKeys.GO_TO_COMPANIES,
    NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
    NoSelectionRecordActionKeys.GO_TO_DASHBOARDS,
    NoSelectionRecordActionKeys.GO_TO_SETTINGS,
    NoSelectionRecordActionKeys.GO_TO_TASKS,
    NoSelectionRecordActionKeys.GO_TO_NOTES,
  ],
  propertiesToOverwrite: {
    [NoSelectionRecordActionKeys.CREATE_NEW_RECORD]: {
      position: 0,
      label: msg`Create new workflow`,
    },
    [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
      position: 10,
    },
    [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
      position: 11,
    },
    [SingleRecordActionKeys.DELETE]: {
      position: 12,
      label: msg`Delete workflow`,
    },
    [MultipleRecordsActionKeys.DELETE]: {
      position: 13,
      label: msg`Delete workflows`,
    },
    [SingleRecordActionKeys.DESTROY]: {
      position: 14,
      label: msg`Permanently destroy workflow`,
    },
    [SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX]: {
      position: 15,
      label: msg`Export workflow`,
      shouldBeRegistered: ({ selectedRecord }) =>
        !isDefined(selectedRecord?.deletedAt),
    },
    [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
      position: 16,
      label: msg`Export workflow`,
    },
    [MultipleRecordsActionKeys.EXPORT]: {
      position: 17,
      label: msg`Export workflows`,
    },
    [NoSelectionRecordActionKeys.EXPORT_VIEW]: {
      position: 17,
      label: msg`Export view`,
    },
    [MultipleRecordsActionKeys.DESTROY]: {
      position: 18,
      label: msg`Permanently destroy workflows`,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
      position: 19,
      label: msg`Navigate to previous workflow`,
    },
    [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
      position: 20,
      label: msg`Navigate to next workflow`,
    },
    [NoSelectionRecordActionKeys.SEE_DELETED_RECORDS]: {
      position: 21,
      label: msg`See deleted workflows`,
    },
    [NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS]: {
      position: 22,
      label: msg`Hide deleted workflows`,
    },
    [NoSelectionRecordActionKeys.IMPORT_RECORDS]: {
      position: 23,
      label: msg`Import workflows`,
    },
    [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
      position: 24,
    },
    [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
      position: 25,
    },
    [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
      position: 26,
    },
    [NoSelectionRecordActionKeys.GO_TO_DASHBOARDS]: {
      position: 27,
    },
    [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
      position: 28,
    },
    [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
      position: 29,
    },
    [NoSelectionRecordActionKeys.GO_TO_NOTES]: {
      position: 30,
    },
  },
});

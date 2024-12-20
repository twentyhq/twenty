import { useNavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToNextRecordSingleRecordAction';
import { useNavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToPreviousRecordSingleRecordAction';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { useActivateDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateDraftWorkflowSingleRecordAction';
import { useActivateLastPublishedVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateLastPublishedVersionWorkflowSingleRecordAction';
import { useDeactivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowSingleRecordAction';
import { useDiscardDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardDraftWorkflowSingleRecordAction';
import { useSeeActiveVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeActiveVersionWorkflowSingleRecordAction';
import { useSeeRunsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeRunsWorkflowSingleRecordAction';
import { useSeeVersionsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeVersionsWorkflowSingleRecordAction';
import { useTestWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useTestWorkflowSingleRecordAction';
import { WorkflowSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-actions/types/WorkflowSingleRecordActionsKeys';
import { ActionAvailableOn } from '@/action-menu/actions/types/actionAvailableOn';
import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
  IconChevronDown,
  IconChevronUp,
  IconHistory,
  IconHistoryToggle,
  IconPlayerPause,
  IconPlayerPlay,
  IconPower,
  IconTrash,
} from 'twenty-ui';

export const WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    actionHook: SingleRecordActionHook;
  }
> = {
  activateWorkflowDraftSingleRecord: {
    key: WorkflowSingleRecordActionKeys.ACTIVATE_DRAFT,
    label: 'Activate Draft',
    shortLabel: 'Activate Draft',
    isPinned: true,
    position: 1,
    Icon: IconPower,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useActivateDraftWorkflowSingleRecordAction,
  },
  activateWorkflowLastPublishedVersionSingleRecord: {
    key: WorkflowSingleRecordActionKeys.ACTIVATE_LAST_PUBLISHED,
    label: 'Activate last published version',
    shortLabel: 'Activate last version',
    isPinned: true,
    position: 2,
    Icon: IconPower,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useActivateLastPublishedVersionWorkflowSingleRecordAction,
  },
  deactivateWorkflowSingleRecord: {
    key: WorkflowSingleRecordActionKeys.DEACTIVATE,
    label: 'Deactivate Workflow',
    shortLabel: 'Deactivate',
    isPinned: true,
    position: 3,
    Icon: IconPlayerPause,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useDeactivateWorkflowSingleRecordAction,
  },
  discardWorkflowDraftSingleRecord: {
    key: WorkflowSingleRecordActionKeys.DISCARD_DRAFT,
    label: 'Discard Draft',
    shortLabel: 'Discard Draft',
    isPinned: true,
    position: 4,
    Icon: IconTrash,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useDiscardDraftWorkflowSingleRecordAction,
  },
  seeWorkflowActiveVersionSingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_ACTIVE_VERSION,
    label: 'See active version',
    shortLabel: 'See active version',
    isPinned: false,
    position: 5,
    Icon: IconHistory,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useSeeActiveVersionWorkflowSingleRecordAction,
  },
  seeWorkflowRunsSingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_RUNS,
    label: 'See runs',
    shortLabel: 'See runs',
    isPinned: false,
    position: 6,
    Icon: IconHistoryToggle,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useSeeRunsWorkflowSingleRecordAction,
  },
  seeWorkflowVersionsHistorySingleRecord: {
    key: WorkflowSingleRecordActionKeys.SEE_VERSIONS,
    label: 'See versions history',
    shortLabel: 'See versions',
    isPinned: false,
    position: 7,
    Icon: IconHistory,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useSeeVersionsWorkflowSingleRecordAction,
  },
  testWorkflowSingleRecord: {
    key: WorkflowSingleRecordActionKeys.TEST,
    label: 'Test Workflow',
    shortLabel: 'Test',
    isPinned: true,
    position: 8,
    Icon: IconPlayerPlay,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useTestWorkflowSingleRecordAction,
  },
  navigateToPreviousRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
    label: 'Navigate to previous workflow',
    shortLabel: '',
    position: 9,
    Icon: IconChevronUp,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToPreviousRecordSingleRecordAction,
  },
  navigateToNextRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
    label: 'Navigate to next workflow',
    shortLabel: '',
    position: 10,
    Icon: IconChevronDown,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToNextRecordSingleRecordAction,
  },
};

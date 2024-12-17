import { useNavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToNextRecordSingleRecordAction';
import { useNavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToPreviousRecordSingleRecordAction';
import { useActivateDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateDraftWorkflowSingleRecordAction';
import { useActivateLastPublishedVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateLastPublishedVersionWorkflowSingleRecordAction';
import { useDeactivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowSingleRecordAction';
import { useDiscardDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardDraftWorkflowSingleRecordAction';
import { useSeeActiveVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeActiveVersionWorkflowSingleRecordAction';
import { useSeeRunsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeRunsWorkflowSingleRecordAction';
import { useSeeVersionsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeVersionsWorkflowSingleRecordAction';
import { useTestWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useTestWorkflowSingleRecordAction';
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
    key: 'activate-workflow-draft-single-record',
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
    key: 'activate-workflow-last-published-version-single-record',
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
    key: 'deactivate-workflow-single-record',
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
    key: 'discard-workflow-draft-single-record',
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
    key: 'see-workflow-active-version-single-record',
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
    key: 'see-workflow-runs-single-record',
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
    key: 'see-workflow-versions-history-single-record',
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
    key: 'test-workflow-single-record',
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
    key: 'navigate-to-previous-record',
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
    key: 'navigate-to-next-record',
    label: 'Navigate to next workflow',
    shortLabel: '',
    position: 10,
    Icon: IconChevronDown,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToNextRecordSingleRecordAction,
  },
};

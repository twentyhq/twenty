import { useActivateWorkflowDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowDraftWorkflowSingleRecordAction';
import { useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction';
import { useDeactivateWorkflowWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowWorkflowSingleRecordAction';
import { useDiscardDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardDraftWorkflowSingleRecordAction';
import { useSeeWorkflowActiveVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowActiveVersionWorkflowSingleRecordAction';
import { useSeeWorkflowRunsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowRunsWorkflowSingleRecordAction';
import { useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction';
import { useTestWorkflowWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useTestWorkflowWorkflowSingleRecordAction';
import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
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
    isPinned: true,
    position: 1,
    Icon: IconPower,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    actionHook: useActivateWorkflowDraftWorkflowSingleRecordAction,
  },
  activateWorkflowLastPublishedVersionSingleRecord: {
    key: 'activate-workflow-last-published-version-single-record',
    label: 'Activate last published version',
    isPinned: true,
    position: 2,
    Icon: IconPower,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    actionHook:
      useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction,
  },
  deactivateWorkflowSingleRecord: {
    key: 'deactivate-workflow-single-record',
    label: 'Deactivate Workflow',
    isPinned: true,
    position: 3,
    Icon: IconPlayerPause,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    actionHook: useDeactivateWorkflowWorkflowSingleRecordAction,
  },
  discardWorkflowDraftSingleRecord: {
    key: 'discard-workflow-draft-single-record',
    label: 'Discard Draft',
    isPinned: true,
    position: 4,
    Icon: IconTrash,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    actionHook: useDiscardDraftWorkflowSingleRecordAction,
  },
  seeWorkflowActiveVersionSingleRecord: {
    key: 'see-workflow-active-version-single-record',
    label: 'See active version',
    isPinned: false,
    position: 5,
    Icon: IconHistory,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    actionHook: useSeeWorkflowActiveVersionWorkflowSingleRecordAction,
  },
  seeWorkflowRunsSingleRecord: {
    key: 'see-workflow-runs-single-record',
    label: 'See runs',
    isPinned: false,
    position: 6,
    Icon: IconHistoryToggle,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    actionHook: useSeeWorkflowRunsWorkflowSingleRecordAction,
  },
  seeWorkflowVersionsHistorySingleRecord: {
    key: 'see-workflow-versions-history-single-record',
    label: 'See versions history',
    isPinned: false,
    position: 7,
    Icon: IconHistory,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    actionHook: useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction,
  },
  testWorkflowSingleRecord: {
    key: 'test-workflow-single-record',
    label: 'Test Workflow',
    isPinned: true,
    position: 8,
    Icon: IconPlayerPlay,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    actionHook: useTestWorkflowWorkflowSingleRecordAction,
  },
};

import { useNavigateToNextRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToNextRecordSingleRecordAction';
import { useNavigateToPreviousRecordSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useNavigateToPreviousRecordSingleRecordAction';
import { useSeeExecutionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeExecutionsWorkflowVersionSingleRecordAction';
import { useSeeVersionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeVersionsWorkflowVersionSingleRecordAction';
import { useUseAsDraftWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useUseAsDraftWorkflowVersionSingleRecordAction';
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
  IconPencil,
} from 'twenty-ui';

export const WORKFLOW_VERSIONS_SINGLE_RECORD_ACTIONS_CONFIG: Record<
  string,
  ActionMenuEntry & {
    actionHook: SingleRecordActionHook;
  }
> = {
  useAsDraftWorkflowVersionSingleRecord: {
    key: 'use-as-draft-workflow-version-single-record',
    label: 'Use as draft',
    position: 1,
    isPinned: true,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconPencil,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useUseAsDraftWorkflowVersionSingleRecordAction,
  },
  seeWorkflowExecutionsSingleRecord: {
    key: 'see-workflow-executions-single-record',
    label: 'See executions',
    position: 2,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconHistoryToggle,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useSeeExecutionsWorkflowVersionSingleRecordAction,
  },
  seeWorkflowVersionsHistorySingleRecord: {
    key: 'see-workflow-versions-history-single-record',
    label: 'See versions history',
    position: 3,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconHistory,
    availableOn: [
      ActionAvailableOn.SHOW_PAGE,
      ActionAvailableOn.INDEX_PAGE_SINGLE_RECORD_SELECTION,
    ],
    actionHook: useSeeVersionsWorkflowVersionSingleRecordAction,
  },
  navigateToPreviousRecord: {
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    key: 'navigate-to-previous-record',
    label: 'Navigate to previous version',
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
    label: 'Navigate to next version',
    shortLabel: '',
    position: 10,
    Icon: IconChevronDown,
    availableOn: [ActionAvailableOn.SHOW_PAGE],
    actionHook: useNavigateToNextRecordSingleRecordAction,
  },
};

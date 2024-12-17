import { useSeeExecutionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeExecutionsWorkflowVersionSingleRecordAction';
import { useSeeVersionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useSeeVersionsWorkflowVersionSingleRecordAction';
import { useUseAsDraftWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/hooks/useUseAsDraftWorkflowVersionSingleRecordAction';
import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { IconHistory, IconHistoryToggle, IconPencil } from 'twenty-ui';

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
    actionHook: useUseAsDraftWorkflowVersionSingleRecordAction,
  },
  seeWorkflowExecutionsSingleRecord: {
    key: 'see-workflow-executions-single-record',
    label: 'See executions',
    position: 2,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconHistoryToggle,
    actionHook: useSeeExecutionsWorkflowVersionSingleRecordAction,
  },
  seeWorkflowVersionsHistorySingleRecord: {
    key: 'see-workflow-versions-history-single-record',
    label: 'See versions history',
    position: 3,
    type: ActionMenuEntryType.Standard,
    scope: ActionMenuEntryScope.RecordSelection,
    Icon: IconHistory,
    actionHook: useSeeVersionsWorkflowVersionSingleRecordAction,
  },
};

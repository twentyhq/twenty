import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// oxlint-disable lingui/no-unlocalized-strings -- Persisted output labels are matched to these canonical keys before their descriptors are translated.
export const WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS: Array<{
  stepType: WorkflowActionType;
  key: string;
  label: string;
  message: MessageDescriptor;
}> = [
  {
    stepType: 'ITERATOR',
    key: 'currentItem',
    label: 'Current Item',
    message: msg`Current Item`,
  },
  {
    stepType: 'ITERATOR',
    key: 'currentItemIndex',
    label: 'Current Item Index',
    message: msg`Current Item Index`,
  },
  {
    stepType: 'ITERATOR',
    key: 'hasProcessedAllItems',
    label: 'Has Processed All Items',
    message: msg`Has Processed All Items`,
  },
  {
    stepType: 'AI_AGENT',
    key: 'response',
    label: 'Response',
    message: msg`Response`,
  },
];

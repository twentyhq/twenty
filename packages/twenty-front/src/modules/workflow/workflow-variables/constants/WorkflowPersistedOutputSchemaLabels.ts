import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';

export const WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS: Array<{
  stepType: WorkflowActionType;
  key: string;
  label: string;
  message: MessageDescriptor;
}> = doNotTranslate([
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
]);

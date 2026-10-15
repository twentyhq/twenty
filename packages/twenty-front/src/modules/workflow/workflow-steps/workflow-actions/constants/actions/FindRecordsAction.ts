import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const FIND_RECORDS_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'FIND_RECORDS'>;
  icon: string;
} = {
  defaultLabel: msg`Search Records`,
  type: 'FIND_RECORDS',
  icon: 'IconSearch',
};

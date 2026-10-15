import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const DRAFT_EMAIL_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'DRAFT_EMAIL'>;
  icon: string;
} = {
  defaultLabel: msg`Draft Email`,
  type: 'DRAFT_EMAIL',
  icon: 'IconMailPlus',
};

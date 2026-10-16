import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const UPSERT_RECORD_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'UPSERT_RECORD'>;
  icon: string;
} = {
  defaultLabel: msg`Create or Update Record`,
  type: 'UPSERT_RECORD',
  icon: 'IconPencilPlus',
};

import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const CREATE_CALENDAR_EVENT_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'CREATE_CALENDAR_EVENT'>;
  icon: string;
} = {
  defaultLabel: msg`Create Calendar Event`,
  type: 'CREATE_CALENDAR_EVENT',
  icon: 'IconCalendarEvent',
};

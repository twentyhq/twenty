import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const CREATE_CALENDAR_EVENT_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'CREATE_CALENDAR_EVENT'>;
  icon: string;
} = {
  defaultLabel: 'Create Calendar Event',
  type: 'CREATE_CALENDAR_EVENT',
  icon: 'IconCalendarEvent',
};

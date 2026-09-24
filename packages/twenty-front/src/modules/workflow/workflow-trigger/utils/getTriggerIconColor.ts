import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { themeCssVariables } from 'twenty-ui/theme';

export const getTriggerIconColor = (
  triggerType: WorkflowTriggerType,
): string => {
  switch (triggerType) {
    case 'DATABASE_EVENT':
      return themeCssVariables.color.blue9;
    case 'CRON':
    case 'MANUAL':
    case 'WEBHOOK':
      return themeCssVariables.color.purple9;
    default:
      return themeCssVariables.color.purple9;
  }
};

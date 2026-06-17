import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const getTriggerIconColor = (
  triggerType: WorkflowTriggerType,
): string => {
  switch (triggerType) {
    case 'DATABASE_EVENT':
      return themeCssVariables.color.blue;
    case 'CRON':
    case 'MANUAL':
    case 'WEBHOOK':
      return themeCssVariables.color.purple;
    default:
      return themeCssVariables.color.purple;
  }
};

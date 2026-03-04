import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { type ThemeType } from 'twenty-ui/theme';

export const getTriggerIconColor = ({
  theme,
  triggerType,
}: {
  theme: ThemeType;
  triggerType: WorkflowTriggerType;
}) => {
  switch (triggerType) {
    case 'DATABASE_EVENT':
      return theme.color.blue;
    case 'CRON':
    case 'MANUAL':
    case 'WEBHOOK':
      return theme.color.purple;
    default:
      return theme.color.purple;
  }
};

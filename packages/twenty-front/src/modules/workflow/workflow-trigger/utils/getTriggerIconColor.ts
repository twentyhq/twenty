import { type Theme } from '@emotion/react';
import { type WorkflowTriggerType } from '@/workflow/types/Workflow';

export const getTriggerIconColor = ({
  theme,
  triggerType,
}: {
  theme: Theme;
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

import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { Theme } from '@emotion/react';

export type WorkflowDiagramNodeSelectedColors = {
  background: string;
  borderColor: string;
};

export const getWorkflowDiagramNodeSelectedColors = (
  variant: WorkflowDiagramNodeVariant,
  theme: Theme,
): WorkflowDiagramNodeSelectedColors => {
  switch (variant) {
    case 'running': {
      return {
        background: theme.adaptiveColors.yellow1,
        borderColor: theme.adaptiveColors.yellow4,
      };
    }
    case 'success': {
      return {
        background: theme.adaptiveColors.turquoise1,
        borderColor: theme.adaptiveColors.turquoise4,
      };
    }
    case 'failure': {
      return {
        background: theme.background.danger,
        borderColor: theme.color.red,
      };
    }
    default: {
      return {
        background: theme.adaptiveColors.blue1,
        borderColor: theme.color.blue,
      };
    }
  }
};

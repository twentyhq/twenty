import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { type Theme } from '@emotion/react';

type WorkflowDiagramColors = {
  background: string;
  borderColor: string;
  color: string;
  titleColor: string;
};

export type WorkflowDiagramNodeColors = {
  selected: WorkflowDiagramColors;
  unselected: WorkflowDiagramColors;
};

export const getWorkflowDiagramColors = ({
  theme,
  runStatus,
}: {
  theme: Theme;
  runStatus?: WorkflowRunStepStatus;
}): WorkflowDiagramNodeColors => {
  switch (runStatus) {
    case 'PENDING':
    case 'RUNNING': {
      return {
        selected: {
          background: theme.adaptiveColors.yellow1,
          borderColor: theme.color.yellow,
          color: theme.tag.text.yellow,
          titleColor: theme.font.color.primary,
        },
        unselected: {
          background: theme.background.secondary,
          borderColor: theme.border.color.strong,
          color: theme.tag.text.yellow,
          titleColor: theme.font.color.primary,
        },
      };
    }
    case 'FAILED':
    case 'STOPPED': {
      return {
        selected: {
          background: theme.adaptiveColors.red1,
          borderColor: theme.color.red,
          color: theme.tag.text.red,
          titleColor: theme.font.color.primary,
        },
        unselected: {
          background: theme.background.secondary,
          borderColor: theme.border.color.strong,
          color: theme.tag.text.red,
          titleColor: theme.font.color.primary,
        },
      };
    }
    case 'SUCCESS': {
      return {
        selected: {
          background: theme.adaptiveColors.turquoise1,
          borderColor: theme.color.turquoise,
          color: theme.tag.text.green,
          titleColor: theme.font.color.primary,
        },
        unselected: {
          background: theme.background.secondary,
          borderColor: theme.border.color.strong,
          color: theme.tag.text.green,
          titleColor: theme.font.color.primary,
        },
      };
    }
    default: {
      return {
        selected: {
          background: theme.adaptiveColors.blue1,
          borderColor: theme.color.blue,
          color: theme.tag.text.blue,
          titleColor: theme.font.color.primary,
        },
        unselected: {
          background: theme.background.secondary,
          borderColor: theme.border.color.strong,
          color: theme.font.color.tertiary,
          titleColor: theme.font.color.light,
        },
      };
    }
  }
};

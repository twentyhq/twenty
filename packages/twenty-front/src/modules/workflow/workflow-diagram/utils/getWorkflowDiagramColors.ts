import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { type Theme } from '@emotion/react';

type WorkflowDiagramColors = {
  background: string;
  borderColor: string;
  color: string;
  titleColor: string;
  tagBackground: string;
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
          background: theme.color.yellow2,
          borderColor: theme.color.yellow,
          color: theme.tag.text.yellow,
          titleColor: theme.font.color.primary,
          tagBackground: theme.tag.background.yellow,
        },
        unselected: {
          background: theme.background.secondary,
          borderColor: theme.border.color.strong,
          color: theme.tag.text.yellow,
          titleColor: theme.font.color.primary,
          tagBackground: theme.tag.background.yellow,
        },
      };
    }
    case 'FAILED': {
      return {
        selected: {
          background: theme.color.red2,
          borderColor: theme.color.red,
          color: theme.tag.text.red,
          titleColor: theme.font.color.primary,
          tagBackground: theme.tag.background.red,
        },
        unselected: {
          background: theme.background.secondary,
          borderColor: theme.border.color.strong,
          color: theme.tag.text.red,
          titleColor: theme.font.color.primary,
          tagBackground: theme.tag.background.red,
        },
      };
    }
    case 'STOPPED':
    case 'SUCCESS': {
      return {
        selected: {
          background: theme.color.turquoise2,
          borderColor: theme.color.turquoise,
          color: theme.tag.text.green,
          titleColor: theme.font.color.primary,
          tagBackground: theme.tag.background.turquoise,
        },
        unselected: {
          background: theme.background.secondary,
          borderColor: theme.border.color.strong,
          color: theme.tag.text.green,
          titleColor: theme.font.color.primary,
          tagBackground: theme.tag.background.turquoise,
        },
      };
    }
    default: {
      return {
        selected: {
          background: theme.color.blue2,
          borderColor: theme.color.blue,
          color: theme.tag.text.blue,
          titleColor: theme.font.color.primary,
          tagBackground: theme.border.color.strong,
        },
        unselected: {
          background: theme.background.secondary,
          borderColor: theme.border.color.strong,
          color: theme.font.color.tertiary,
          titleColor: theme.font.color.light,
          tagBackground: theme.border.color.strong,
        },
      };
    }
  }
};

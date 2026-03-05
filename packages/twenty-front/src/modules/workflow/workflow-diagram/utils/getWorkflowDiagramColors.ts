import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  runStatus,
}: {
  runStatus?: WorkflowRunStepStatus;
}): WorkflowDiagramNodeColors => {
  switch (runStatus) {
    case 'PENDING':
    case 'RUNNING': {
      return {
        selected: {
          background: themeCssVariables.color.yellow2,
          borderColor: themeCssVariables.color.yellow,
          color: themeCssVariables.tag.text.yellow,
          titleColor: themeCssVariables.font.color.primary,
          tagBackground: themeCssVariables.tag.background.yellow,
        },
        unselected: {
          background: themeCssVariables.background.secondary,
          borderColor: themeCssVariables.border.color.strong,
          color: themeCssVariables.tag.text.yellow,
          titleColor: themeCssVariables.font.color.primary,
          tagBackground: themeCssVariables.tag.background.yellow,
        },
      };
    }
    case 'FAILED':
    case 'FAILED_SAFELY': {
      return {
        selected: {
          background: themeCssVariables.color.red2,
          borderColor: themeCssVariables.color.red,
          color: themeCssVariables.tag.text.red,
          titleColor: themeCssVariables.font.color.primary,
          tagBackground: themeCssVariables.tag.background.red,
        },
        unselected: {
          background: themeCssVariables.background.secondary,
          borderColor: themeCssVariables.border.color.strong,
          color: themeCssVariables.tag.text.red,
          titleColor: themeCssVariables.font.color.primary,
          tagBackground: themeCssVariables.tag.background.red,
        },
      };
    }
    case 'STOPPED':
    case 'SUCCESS': {
      return {
        selected: {
          background: themeCssVariables.color.turquoise2,
          borderColor: themeCssVariables.color.turquoise,
          color: themeCssVariables.tag.text.green,
          titleColor: themeCssVariables.font.color.primary,
          tagBackground: themeCssVariables.tag.background.turquoise,
        },
        unselected: {
          background: themeCssVariables.background.secondary,
          borderColor: themeCssVariables.border.color.strong,
          color: themeCssVariables.tag.text.green,
          titleColor: themeCssVariables.font.color.primary,
          tagBackground: themeCssVariables.tag.background.turquoise,
        },
      };
    }
    default: {
      return {
        selected: {
          background: themeCssVariables.color.blue2,
          borderColor: themeCssVariables.color.blue,
          color: themeCssVariables.tag.text.blue,
          titleColor: themeCssVariables.font.color.primary,
          tagBackground: themeCssVariables.border.color.strong,
        },
        unselected: {
          background: themeCssVariables.background.secondary,
          borderColor: themeCssVariables.border.color.strong,
          color: themeCssVariables.font.color.tertiary,
          titleColor: themeCssVariables.font.color.light,
          tagBackground: themeCssVariables.border.color.strong,
        },
      };
    }
  }
};

import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { assertUnreachable } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export const WorkflowDiagramStepNodeIcon = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(getWorkflowNodeIconKey(data));

  switch (data.nodeType) {
    case 'trigger': {
      switch (data.triggerType) {
        case 'DATABASE_EVENT': {
          return (
            <Icon
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              color={resolveThemeVariable(themeCssVariables.color.blue)}
            />
          );
        }
        case 'MANUAL':
        case 'CRON':
        case 'WEBHOOK': {
          return (
            <Icon
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              color={resolveThemeVariable(themeCssVariables.color.purple)}
            />
          );
        }
      }

      return assertUnreachable(data.triggerType);
    }
    case 'action': {
      switch (data.actionType) {
        case 'CODE':
        case 'HTTP_REQUEST':
        case 'SEND_EMAIL':
        case 'DRAFT_EMAIL': {
          return (
            <Icon
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              color={resolveThemeVariable(themeCssVariables.color.red)}
              stroke={resolveThemeVariableAsNumber(
                themeCssVariables.icon.stroke.sm,
              )}
            />
          );
        }
        case 'FORM': {
          return (
            <Icon
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              color={resolveThemeVariable(themeCssVariables.color.orange)}
            />
          );
        }
        case 'AI_AGENT': {
          return (
            <Icon
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              color={resolveThemeVariable(themeCssVariables.color.pink)}
            />
          );
        }
        case 'EMPTY':
          return null;
        case 'DELAY':
        case 'FILTER':
        case 'ITERATOR':
          return (
            <Icon
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              color={resolveThemeVariable(themeCssVariables.color.green12)}
            />
          );
        default: {
          return (
            <Icon
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              color={resolveThemeVariable(
                themeCssVariables.font.color.tertiary,
              )}
              stroke={resolveThemeVariableAsNumber(
                themeCssVariables.icon.stroke.sm,
              )}
            />
          );
        }
      }
    }
  }
};

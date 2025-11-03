import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useTheme } from '@emotion/react';
import { assertUnreachable } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowDiagramStepNodeIcon = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(getWorkflowNodeIconKey(data));

  switch (data.nodeType) {
    case 'trigger': {
      switch (data.triggerType) {
        case 'DATABASE_EVENT': {
          return <Icon size={theme.icon.size.md} color={theme.color.blue} />;
        }
        case 'MANUAL':
        case 'CRON':
        case 'WEBHOOK': {
          return <Icon size={theme.icon.size.md} color={theme.color.purple} />;
        }
      }

      return assertUnreachable(data.triggerType);
    }
    case 'action': {
      switch (data.actionType) {
        case 'CODE':
        case 'HTTP_REQUEST':
        case 'SEND_EMAIL': {
          return (
            <Icon
              size={theme.icon.size.md}
              color={theme.color.red}
              stroke={theme.icon.stroke.sm}
            />
          );
        }
        case 'FORM': {
          return <Icon size={theme.icon.size.md} color={theme.color.orange} />;
        }
        case 'AI_AGENT': {
          return <Icon size={theme.icon.size.md} color={theme.color.pink} />;
        }
        case 'EMPTY':
          return null;
        case 'DELAY':
        case 'FILTER':
        case 'ITERATOR':
          return <Icon size={theme.icon.size.md} color={theme.color.green12} />;
        default: {
          return (
            <Icon
              size={theme.icon.size.md}
              color={theme.font.color.tertiary}
              stroke={theme.icon.stroke.sm}
            />
          );
        }
      }
    }
  }
};

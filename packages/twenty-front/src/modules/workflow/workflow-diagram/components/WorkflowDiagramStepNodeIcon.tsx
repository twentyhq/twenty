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
        case 'DATABASE_EVENT':
        case 'MANUAL':
        case 'CRON':
        case 'WEBHOOK': {
          return (
            <Icon size={theme.icon.size.lg} color={theme.font.color.tertiary} />
          );
        }
      }

      return assertUnreachable(data.triggerType);
    }
    case 'action': {
      switch (data.actionType) {
        case 'CODE':
        case 'HTTP_REQUEST': {
          return (
            <Icon
              size={theme.icon.size.lg}
              color={theme.color.orange}
              stroke={theme.icon.stroke.sm}
            />
          );
        }
        case 'SEND_EMAIL': {
          return <Icon size={theme.icon.size.lg} color={theme.color.blue} />;
        }
        case 'AI_AGENT': {
          return <Icon size={theme.icon.size.lg} color={theme.color.pink} />;
        }
        default: {
          return (
            <Icon
              size={theme.icon.size.lg}
              color={theme.font.color.tertiary}
              stroke={theme.icon.stroke.sm}
            />
          );
        }
      }
    }
  }
};

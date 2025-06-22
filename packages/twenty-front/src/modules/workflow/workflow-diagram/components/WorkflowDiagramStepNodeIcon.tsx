import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui/display';

const StyledStepNodeLabelIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

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
            <StyledStepNodeLabelIconContainer>
              <Icon
                size={theme.icon.size.md}
                color={theme.font.color.tertiary}
              />
            </StyledStepNodeLabelIconContainer>
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
            <StyledStepNodeLabelIconContainer>
              <Icon
                size={theme.icon.size.md}
                color={theme.color.orange}
                stroke={theme.icon.stroke.sm}
              />
            </StyledStepNodeLabelIconContainer>
          );
        }
        case 'SEND_EMAIL': {
          return (
            <StyledStepNodeLabelIconContainer>
              <Icon size={theme.icon.size.md} color={theme.color.blue} />
            </StyledStepNodeLabelIconContainer>
          );
        }
        case 'AI_AGENT': {
          return (
            <StyledStepNodeLabelIconContainer>
              <Icon size={theme.icon.size.md} color={theme.color.pink} />
            </StyledStepNodeLabelIconContainer>
          );
        }
        default: {
          return (
            <StyledStepNodeLabelIconContainer>
              <Icon
                size={theme.icon.size.md}
                color={theme.font.color.tertiary}
                stroke={theme.icon.stroke.sm}
              />
            </StyledStepNodeLabelIconContainer>
          );
        }
      }
    }
  }
};

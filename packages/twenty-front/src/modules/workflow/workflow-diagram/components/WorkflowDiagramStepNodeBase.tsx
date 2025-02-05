import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { WorkflowDiagramBaseStepNode } from '@/workflow/workflow-diagram/components/WorkflowDiagramBaseStepNode';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui';

const StyledStepNodeLabelIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowDiagramStepNodeBase = ({
  data,
  variant,
  RightFloatingElement,
}: {
  data: WorkflowDiagramStepNodeData;
  variant: WorkflowDiagramNodeVariant;
  RightFloatingElement?: React.ReactNode;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(getWorkflowNodeIconKey(data));

  const renderStepIcon = () => {
    switch (data.nodeType) {
      case 'trigger': {
        switch (data.triggerType) {
          case 'DATABASE_EVENT': {
            return (
              <StyledStepNodeLabelIconContainer>
                <Icon
                  size={theme.icon.size.md}
                  color={theme.font.color.tertiary}
                />
              </StyledStepNodeLabelIconContainer>
            );
          }
          case 'MANUAL': {
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
          case 'CODE': {
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

  return (
    <WorkflowDiagramBaseStepNode
      name={data.name}
      variant={variant}
      nodeType={data.nodeType}
      Icon={renderStepIcon()}
      RightFloatingElement={RightFloatingElement}
    />
  );
};

import { WorkflowDiagramBaseStepNode } from '@/workflow/components/WorkflowDiagramBaseStepNode';
import { WorkflowDiagramStepNodeData } from '@/workflow/types/WorkflowDiagram';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCode, IconPlaylistAdd } from 'twenty-ui';

const StyledStepNodeLabelIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowDiagramStepNode = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  const theme = useTheme();

  const renderStepIcon = () => {
    switch (data.nodeType) {
      case 'trigger': {
        return (
          <StyledStepNodeLabelIconContainer>
            <IconPlaylistAdd
              size={theme.icon.size.sm}
              color={theme.font.color.tertiary}
            />
          </StyledStepNodeLabelIconContainer>
        );
      }
      case 'action': {
        return (
          <StyledStepNodeLabelIconContainer>
            <IconCode size={theme.icon.size.sm} color={theme.color.orange} />
          </StyledStepNodeLabelIconContainer>
        );
      }
    }

    return null;
  };

  return (
    <WorkflowDiagramBaseStepNode
      nodeType={data.nodeType}
      label={data.label}
      Icon={renderStepIcon()}
    />
  );
};

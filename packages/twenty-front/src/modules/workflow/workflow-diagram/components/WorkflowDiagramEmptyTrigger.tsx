import { WorkflowDiagramBaseStepNode } from '@/workflow/workflow-diagram/components/WorkflowDiagramBaseStepNode';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlaylistAdd } from 'twenty-ui';

const StyledStepNodeLabelIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowDiagramEmptyTrigger = () => {
  const theme = useTheme();

  return (
    <WorkflowDiagramBaseStepNode
      name="Add a Trigger"
      nodeType="trigger"
      variant="placeholder"
      Icon={
        <StyledStepNodeLabelIconContainer>
          <IconPlaylistAdd size={16} color={theme.font.color.tertiary} />
        </StyledStepNodeLabelIconContainer>
      }
    />
  );
};

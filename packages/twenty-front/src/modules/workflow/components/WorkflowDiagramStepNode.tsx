import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';
import { WorkflowDiagramBaseStepNode } from '@/workflow/components/WorkflowDiagramBaseStepNode';
import { useDeleteOneStep } from '@/workflow/hooks/useDeleteOneStep';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowDiagramStepNodeData } from '@/workflow/types/WorkflowDiagram';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconCode, IconMail, IconPlaylistAdd, IconTrash } from 'twenty-ui';

const StyledStepNodeLabelIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowDiagramStepNode = ({
  id,
  data,
  selected,
}: {
  id: string;
  data: WorkflowDiagramStepNodeData;
  selected?: boolean;
}) => {
  const theme = useTheme();

  const workflowId = useRecoilValue(workflowIdState);

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);
  assertWorkflowWithCurrentVersionIsDefined(workflowWithCurrentVersion);

  const { deleteOneStep } = useDeleteOneStep({
    workflow: workflowWithCurrentVersion,
    stepId: id,
  });

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
      case 'condition': {
        return null;
      }
      case 'action': {
        switch (data.actionType) {
          case 'CODE': {
            return (
              <StyledStepNodeLabelIconContainer>
                <IconCode
                  size={theme.icon.size.sm}
                  color={theme.color.orange}
                />
              </StyledStepNodeLabelIconContainer>
            );
          }
          case 'SEND_EMAIL': {
            return (
              <StyledStepNodeLabelIconContainer>
                <IconMail size={theme.icon.size.sm} color={theme.color.blue} />
              </StyledStepNodeLabelIconContainer>
            );
          }
        }
      }
    }

    return assertUnreachable(data);
  };

  return (
    <WorkflowDiagramBaseStepNode
      nodeType={data.nodeType}
      label={data.label}
      Icon={renderStepIcon()}
      RightFloatingElement={
        selected ? (
          <FloatingIconButton
            Icon={IconTrash}
            onClick={() => {
              return deleteOneStep();
            }}
          />
        ) : undefined
      }
    />
  );
};

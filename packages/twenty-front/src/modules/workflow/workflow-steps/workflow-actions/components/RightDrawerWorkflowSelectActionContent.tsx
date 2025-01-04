import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/Actions';
import styled from '@emotion/styled';
import { MenuItem } from 'twenty-ui';

const StyledActionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

export const RightDrawerWorkflowSelectActionContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { createStep } = useCreateStep({
    workflow,
  });

  return (
    <StyledActionListContainer>
      {ACTIONS.map((action) => (
        <MenuItem
          key={action.type}
          LeftIcon={action.icon}
          text={action.label}
          onClick={() => {
            return createStep(action.type);
          }}
        />
      ))}
    </StyledActionListContainer>
  );
};

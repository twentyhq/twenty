import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ACTIONS } from '@/workflow/constants/Actions';
import { useCreateStep } from '@/workflow/hooks/useCreateStep';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import styled from '@emotion/styled';

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
    <>
      <StyledActionListContainer>
        {ACTIONS.map((action) => (
          <MenuItem
            LeftIcon={action.icon}
            text={action.label}
            onClick={() => {
              return createStep(action.type);
            }}
          />
        ))}
      </StyledActionListContainer>
    </>
  );
};

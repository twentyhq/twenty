import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useRightDrawerWorkflowSelectAction } from '@/workflow/hooks/useRightDrawerWorkflowSelectAction';
import { Workflow } from '@/workflow/types/Workflow';
import styled from '@emotion/styled';
import { IconSettingsAutomation } from 'twenty-ui';

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
  workflow: Workflow;
}) => {
  const { handleActionClick } = useRightDrawerWorkflowSelectAction({
    workflow,
  });

  return (
    <>
      <StyledActionListContainer>
        <MenuItem
          LeftIcon={IconSettingsAutomation}
          text="Serverless Function"
          onClick={() => {
            handleActionClick('CODE_ACTION');
          }}
        />
      </StyledActionListContainer>
    </>
  );
};

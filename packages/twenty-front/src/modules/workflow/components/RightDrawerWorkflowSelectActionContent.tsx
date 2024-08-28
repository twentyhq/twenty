import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useRightDrawerWorkflowSelectAction } from '@/workflow/hooks/useRightDrawerWorkflowSelectAction';
import { Workflow } from '@/workflow/types/Workflow';
import styled from '@emotion/styled';
import { IconSettingsAutomation } from 'twenty-ui';

// FIXME: copy-pasted
const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
`;

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
      <StyledTabListContainer>
        <TabList loading={false} tabListId={tabListId} tabs={tabs} />
      </StyledTabListContainer>

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

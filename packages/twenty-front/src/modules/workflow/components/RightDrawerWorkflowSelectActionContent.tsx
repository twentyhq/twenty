import { TabList } from '@/ui/layout/tab/components/TabList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useRightDrawerWorkflowSelectAction } from '@/workflow/hooks/useRightDrawerWorkflowSelectAction';
import { Workflow } from '@/workflow/types/Workflow';
import styled from '@emotion/styled';

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

export const TAB_LIST_COMPONENT_ID =
  'workflow-select-action-page-right-tab-list';

export const RightDrawerWorkflowSelectActionContent = ({
  workflow,
}: {
  workflow: Workflow;
}) => {
  const tabListId = `${TAB_LIST_COMPONENT_ID}`;

  const { tabs, options, handleActionClick } =
    useRightDrawerWorkflowSelectAction({ tabListId, workflow });

  return (
    <>
      <StyledTabListContainer>
        <TabList loading={false} tabListId={tabListId} tabs={tabs} />
      </StyledTabListContainer>

      <StyledActionListContainer>
        {options.map((option) => (
          <MenuItem
            key={option.id}
            LeftIcon={option.icon}
            text={option.name}
            onClick={() => {
              handleActionClick(option.id);
            }}
          />
        ))}
      </StyledActionListContainer>
    </>
  );
};

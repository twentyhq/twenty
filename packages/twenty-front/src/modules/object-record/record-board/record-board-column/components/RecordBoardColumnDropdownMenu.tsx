import { useRecordGroupActions } from '@/object-record/record-group/hooks/useRecordGroupActionsNestboxAI';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ViewType } from '@/views/types/ViewType';
import { MenuItem } from 'twenty-ui/navigation';
import styled from '@emotion/styled';

const StyledAIWorkflowMenuItem = styled(MenuItem)`
  div[data-testid="tooltip"] {
    font-weight: 500;
    background: linear-gradient(to right, #5a9dfb, #ff5a8d, #ffad42);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
  }
  
  svg {
    color: #5a9dfb;
    stroke: #5a9dfb;
  }
`;

export const RecordBoardColumnDropdownMenu = () => {
  const recordGroupActions = useRecordGroupActions({
    viewType: ViewType.Kanban,
  });

  return (
    <DropdownContent selectDisabled>
      <DropdownMenuItemsContainer>
        {recordGroupActions.map((action) => {
          const MenuItemComponent =
            action.id === 'aiWorkflowSetup'
              ? StyledAIWorkflowMenuItem
              : MenuItem;
          return (
            <MenuItemComponent
              key={action.id}
              onClick={() => {
                action.callback();
                // closeMenu();
              }}
              LeftIcon={action.icon}
              text={action.label}
            />
          );
        })}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

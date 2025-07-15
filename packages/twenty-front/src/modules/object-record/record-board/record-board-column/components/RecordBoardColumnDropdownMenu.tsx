import { useRecordGroupActions } from '@/object-record/record-group/hooks/useRecordGroupActions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ViewType } from '@/views/types/ViewType';
import { MenuItem } from 'twenty-ui/navigation';

export const RecordBoardColumnDropdownMenu = () => {
  const recordGroupActions = useRecordGroupActions({
    viewType: ViewType.Kanban,
  });

  return (
    <DropdownContent selectDisabled>
      <DropdownMenuItemsContainer>
        {recordGroupActions.map((action) => (
          <MenuItem
            key={action.id}
            onClick={() => {
              action.callback();
            }}
            LeftIcon={action.icon}
            text={action.label}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

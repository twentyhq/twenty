import { ListItem } from 'twenty-ui/primitives/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useRecordGroupActions } from '@/object-record/record-group/hooks/useRecordGroupActions';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ViewType } from '@/views/types/ViewType';

export const RecordBoardColumnDropdownMenu = () => {
  const recordGroupActions = useRecordGroupActions({
    viewType: ViewType.KANBAN,
  });

  return (
    <LegacyDropdownContent selectDisabled>
      <DropdownMenuItemsContainer>
        {recordGroupActions.map((action) => (
          <ListItem
            key={action.id}
            onClick={action.callback}
            startIcon={<SelectOptionIcon Icon={action.icon} />}
          >
            {action.label}
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};

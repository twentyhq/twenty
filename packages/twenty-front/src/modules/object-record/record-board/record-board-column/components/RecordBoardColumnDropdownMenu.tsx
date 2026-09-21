import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { useRecordGroupActions } from '@/object-record/record-group/hooks/useRecordGroupActions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ViewType } from '@/views/types/ViewType';
import { ListItem } from 'twenty-ui/primitives/navigation';

export const RecordBoardColumnDropdownMenu = () => {
  const recordGroupActions = useRecordGroupActions({
    viewType: ViewType.KANBAN,
  });

  return (
    <DropdownContent selectDisabled>
      <DropdownMenuItemsContainer>
        {recordGroupActions.map((action) => (
          <ListItem
            key={action.id}
            onClick={getDropdownMenuItemClickHandler(() => {
              action.callback();
            })}
            startIcon={<SelectOptionIcon Icon={action.icon} />}
          >
            <OverflowingTextWithTooltip text={action.label} />
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

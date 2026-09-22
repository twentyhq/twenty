import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useRecordGroupActions } from '@/object-record/record-group/hooks/useRecordGroupActions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { ViewType } from '@/views/types/ViewType';
import { Menu } from 'twenty-ui/primitives/surfaces';

export const RecordBoardColumnDropdownMenu = () => {
  const recordGroupActions = useRecordGroupActions({
    viewType: ViewType.KANBAN,
  });

  return (
    <DropdownContent selectDisabled>
      <Menu.Group>
        {recordGroupActions.map((action) => (
          <Menu.Item
            key={action.id}
            onClick={action.callback}
            startIcon={<SelectOptionIcon Icon={action.icon} />}
          >
            {action.label}
          </Menu.Item>
        ))}
      </Menu.Group>
    </DropdownContent>
  );
};

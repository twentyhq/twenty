import { useRecordGroupActions } from '@/object-record/record-group/hooks/useRecordGroupActions';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { ViewType } from '@/views/types/ViewType';
import { Dropdown } from 'twenty-ui/components';

export const RecordBoardColumnDropdownMenu = () => {
  const recordGroupActions = useRecordGroupActions({
    viewType: ViewType.KANBAN,
  });

  return (
    <Dropdown.Section>
      {recordGroupActions.map((action) => (
        <Dropdown.ActionItem
          key={action.id}
          onClick={action.callback}
          closeOnClick={action.id !== 'moveLeft' && action.id !== 'moveRight'}
          startIcon={<SelectOptionIcon Icon={action.icon} />}
        >
          {action.label}
        </Dropdown.ActionItem>
      ))}
    </Dropdown.Section>
  );
};

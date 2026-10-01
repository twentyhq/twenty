import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { Dropdown } from 'twenty-ui/components';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type RecordTableWidgetRelationPickerMenuItemProps = {
  relationRecord: SelectableItem;
  onSelect: (relationRecordId: string) => void;
};

export const RecordTableWidgetRelationPickerMenuItem = ({
  relationRecord,
  onSelect,
}: RecordTableWidgetRelationPickerMenuItemProps) => {
  return (
    <Dropdown.OptionItem
      onSelect={() => onSelect(relationRecord.id)}
      selected={false}
      startIcon={
        <Avatar
          src={getAbsoluteImageUrl(relationRecord.avatarUrl)}
          colorSeed={relationRecord.id}
          name={relationRecord.name}
          size="md"
          shape={relationRecord.avatarShape ?? 'circle'}
        />
      }
    >
      {relationRecord.name}
    </Dropdown.OptionItem>
  );
};

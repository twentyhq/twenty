import { MultiItemFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldMenuItem';
import { ArrayDisplay } from '@/ui/field/display/components/ArrayDisplay';

type ArrayFieldMenuItemProps = {
  dropdownId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  value: string;
};

export const ArrayFieldMenuItem = ({
  dropdownId,
  onEdit,
  onDelete,
  value,
}: ArrayFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      value={value}
      onEdit={onEdit}
      onDelete={onDelete}
      DisplayComponent={() => <ArrayDisplay value={[value]} />}
      showPrimaryIcon={false}
      showSetAsPrimaryButton={false}
    />
  );
};

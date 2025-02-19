import { PhoneDisplay } from '@/ui/field/display/components/PhoneDisplay';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type PhonesFieldMenuItemProps = {
  dropdownId: string;
  isPrimary?: boolean;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  phone: { number: string; callingCode: string };
};

export const PhonesFieldMenuItem = ({
  dropdownId,
  isPrimary,
  onEdit,
  onSetAsPrimary,
  onDelete,
  phone,
}: PhonesFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      isPrimary={isPrimary}
      value={{ number: phone.number, callingCode: phone.callingCode }}
      onEdit={onEdit}
      onSetAsPrimary={onSetAsPrimary}
      onDelete={onDelete}
      DisplayComponent={PhoneDisplay}
    />
  );
};

import { type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';
import { PhoneDisplay } from '@/ui/field/display/components/PhoneDisplay';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type PhonesFieldMenuItemProps = {
  dropdownId: string;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  phone: PhoneRecord;
  showPrimaryIcon: boolean;
  showSetAsPrimaryButton: boolean;
};

export const PhonesFieldMenuItem = ({
  dropdownId,
  onEdit,
  onSetAsPrimary,
  onDelete,
  phone,
  showPrimaryIcon,
  showSetAsPrimaryButton,
}: PhonesFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      value={phone}
      onEdit={onEdit}
      onSetAsPrimary={onSetAsPrimary}
      onDelete={onDelete}
      DisplayComponent={PhoneDisplay}
      showPrimaryIcon={showPrimaryIcon}
      showSetAsPrimaryButton={showSetAsPrimaryButton}
    />
  );
};

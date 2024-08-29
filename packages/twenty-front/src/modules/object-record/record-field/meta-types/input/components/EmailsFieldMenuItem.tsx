import { EmailDisplay } from '@/ui/field/display/components/EmailDisplay';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type EmailsFieldMenuItemProps = {
  dropdownId: string;
  isPrimary?: boolean;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  email: string;
};

export const EmailsFieldMenuItem = ({
  dropdownId,
  isPrimary,
  onEdit,
  onSetAsPrimary,
  onDelete,
  email,
}: EmailsFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      isPrimary={isPrimary}
      value={email}
      onEdit={onEdit}
      onSetAsPrimary={onSetAsPrimary}
      onDelete={onDelete}
      DisplayComponent={EmailDisplay}
    />
  );
};

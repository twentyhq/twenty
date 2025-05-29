import { EmailDisplay } from '@/ui/field/display/components/EmailDisplay';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type EmailsFieldMenuItemProps = {
  dropdownId: string;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  email: string;
  showPrimaryIcon: boolean;
  showSetAsPrimaryButton: boolean;
};

export const EmailsFieldMenuItem = ({
  dropdownId,
  onEdit,
  onSetAsPrimary,
  onDelete,
  email,
  showPrimaryIcon,
  showSetAsPrimaryButton,
}: EmailsFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      value={email}
      onEdit={onEdit}
      onSetAsPrimary={onSetAsPrimary}
      onDelete={onDelete}
      DisplayComponent={EmailDisplay}
      showPrimaryIcon={showPrimaryIcon}
      showSetAsPrimaryButton={showSetAsPrimaryButton}
    />
  );
};

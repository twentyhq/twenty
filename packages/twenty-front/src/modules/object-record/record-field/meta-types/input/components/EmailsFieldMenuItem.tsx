import { EmailDisplay } from '@/ui/field/display/components/EmailDisplay';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type EmailsFieldMenuItemProps = {
  dropdownId: string;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  onCopy?: (email: string) => void;
  email: string;
  showPrimaryIcon: boolean;
  showSetAsPrimaryButton: boolean;
  showCopyButton: boolean;
};

export const EmailsFieldMenuItem = ({
  dropdownId,
  onEdit,
  onSetAsPrimary,
  onDelete,
  email,
  showPrimaryIcon,
  showSetAsPrimaryButton,
  showCopyButton,
  onCopy,
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
      showCopyButton={showCopyButton}
      onCopy={onCopy}
    />
  );
};

import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type LinksFieldMenuItemProps = {
  dropdownId: string;
  label: string | null;
  url: string;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  showPrimaryIcon: boolean;
  showSetAsPrimaryButton: boolean;
};

export const LinksFieldMenuItem = ({
  dropdownId,
  label,
  onEdit,
  onSetAsPrimary,
  onDelete,
  url,
  showPrimaryIcon,
  showSetAsPrimaryButton,
}: LinksFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      showPrimaryIcon={showPrimaryIcon}
      showSetAsPrimaryButton={showSetAsPrimaryButton}
      value={{ label, url }}
      onEdit={onEdit}
      onSetAsPrimary={onSetAsPrimary}
      onDelete={onDelete}
      DisplayComponent={LinkDisplay}
    />
  );
};

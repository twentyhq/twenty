import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type LinksFieldMenuItemProps = {
  dropdownId: string;
  isPrimary?: boolean;
  label: string | null;
  url: string;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
};

export const LinksFieldMenuItem = ({
  dropdownId,
  isPrimary,
  label,
  onEdit,
  onSetAsPrimary,
  onDelete,
  url,
}: LinksFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      isPrimary={isPrimary}
      value={{ label, url }}
      onEdit={onEdit}
      onSetAsPrimary={onSetAsPrimary}
      onDelete={onDelete}
      DisplayComponent={LinkDisplay}
    />
  );
};

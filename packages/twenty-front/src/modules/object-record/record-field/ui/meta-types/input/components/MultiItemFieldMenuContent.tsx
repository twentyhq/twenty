import { t } from '@lingui/core/macro';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import {
  IconBookmarkPlus,
  IconCopy,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

type MultiItemFieldMenuContentProps = {
  dropdownId: string;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  showSetAsPrimaryButton?: boolean;
  showCopyButton?: boolean;
};

export const MultiItemFieldMenuContent = ({
  dropdownId,
  onEdit,
  onSetAsPrimary,
  onDelete,
  onCopy,
  showSetAsPrimaryButton = false,
  showCopyButton = false,
}: MultiItemFieldMenuContentProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleSetAsPrimaryClick = () => {
    closeDropdown(dropdownId);
    onSetAsPrimary?.();
  };

  const handleEditClick = () => {
    closeDropdown(dropdownId);
    onEdit?.();
  };

  const handleDeleteClick = () => {
    closeDropdown(dropdownId);
    onDelete?.();
  };

  const handleCopyClick = () => {
    closeDropdown(dropdownId);
    onCopy?.();
  };

  return (
    <>
      {showSetAsPrimaryButton && (
        <MenuItem
          LeftIcon={IconBookmarkPlus}
          text={t`Set as Primary`}
          onClick={handleSetAsPrimaryClick}
        />
      )}
      <MenuItem
        LeftIcon={IconPencil}
        text={t`Edit`}
        onClick={handleEditClick}
      />
      <MenuItem
        accent="danger"
        LeftIcon={IconTrash}
        text={t`Delete`}
        onClick={handleDeleteClick}
      />
      {showCopyButton && (
        <MenuItem
          LeftIcon={IconCopy}
          text={t`Copy`}
          onClick={handleCopyClick}
        />
      )}
    </>
  );
};

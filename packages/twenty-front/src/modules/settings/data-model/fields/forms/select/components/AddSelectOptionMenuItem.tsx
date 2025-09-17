import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AddSelectOptionMenuItemProps = {
  name: string;
  onAddSelectOption?: (optionName: string) => void;
};

export const AddSelectOptionMenuItem = ({
  name,
  onAddSelectOption,
}: AddSelectOptionMenuItemProps) => {
  const trimmedName = name.trim();
  const showAddOption = trimmedName.length > 0 && !!onAddSelectOption;

  const handleClick = () => {
    if (!!onAddSelectOption && trimmedName.length > 0) {
      onAddSelectOption(trimmedName);
    }
  };

  if (!showAddOption) {
    return null;
  }

  return (
    <MenuItem
      onClick={handleClick}
      LeftIcon={IconPlus}
      text={t`Add "${trimmedName}" to options`}
    />
  );
};

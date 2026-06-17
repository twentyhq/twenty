import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
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
  const showAddOption =
    isNonEmptyString(trimmedName) && isDefined(onAddSelectOption);

  const handleClick = () => {
    if (isDefined(onAddSelectOption)) {
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

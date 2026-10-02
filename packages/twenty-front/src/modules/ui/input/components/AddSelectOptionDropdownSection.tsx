import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

type AddSelectOptionDropdownSectionProps = {
  searchFilter: string;
  filteredOptions: SelectOption[];
  onAddSelectOption?: (optionName: string) => void;
};

export const AddSelectOptionDropdownSection = ({
  searchFilter,
  filteredOptions,
  onAddSelectOption,
}: AddSelectOptionDropdownSectionProps) => {
  const optionName = searchFilter.trim();

  if (
    !isDefined(onAddSelectOption) ||
    !isNonEmptyString(optionName) ||
    isNonEmptyArray(filteredOptions)
  ) {
    return null;
  }

  return (
    <>
      <Dropdown.Separator />
      <Dropdown.Section>
        <Dropdown.ActionItem
          onClick={() => onAddSelectOption(optionName)}
          closeOnClick={false}
          startIcon={<IconPlus />}
        >
          {t`Add "${optionName}" to options`}
        </Dropdown.ActionItem>
      </Dropdown.Section>
    </>
  );
};

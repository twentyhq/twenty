import { useLingui } from '@lingui/react/macro';
import { createElement, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { type TagColor, Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type SubMatchingSelectInputProps = {
  onOptionSelected: (selectedOption: SelectOption) => void;
  options: readonly SelectOption[];
  selectedOption?: SelectOption;
};

export const SubMatchingSelectInput = ({
  onOptionSelected,
  options,
  selectedOption,
}: SubMatchingSelectInputProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const { t } = useLingui();
  const searchTerm = normalizeSearchText(searchFilter);
  const matchingOptions = options.filter((option) =>
    normalizeSearchText(option.label).includes(searchTerm),
  );
  const optionsInDropdown = [
    ...matchingOptions.filter(
      (option) => option.value === selectedOption?.value,
    ),
    ...matchingOptions.filter(
      (option) => option.value !== selectedOption?.value,
    ),
  ];

  return (
    <>
      <Dropdown.Search
        value={searchFilter}
        onValueChange={setSearchFilter}
        placeholder={t`Search`}
        aria-label={t`Search`}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {optionsInDropdown.map((option) => (
          <Dropdown.OptionItem
            key={option.value}
            onSelect={() => onOptionSelected(option)}
            selected={selectedOption?.value === option.value}
            disabled={option.disabled}
          >
            <Tag
              color={(option.color as TagColor) ?? 'transparent'}
              borderStyle="dashed"
              variant="soft"
              startIcon={
                isDefined(option.Icon) ? createElement(option.Icon) : undefined
              }
            >
              {option.label}
            </Tag>
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
      {!isNonEmptyArray(optionsInDropdown) && (
        <Dropdown.Empty>{t`No options found`}</Dropdown.Empty>
      )}
    </>
  );
};

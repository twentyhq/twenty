import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { createElement, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Tag } from 'twenty-ui/primitives/data-display';
import { AddSelectOptionDropdownSection } from '@/ui/input/components/AddSelectOptionDropdownSection';
import { SelectOptionDescriptionTooltip } from '@/ui/input/components/SelectOptionDescriptionTooltip';
import { type SelectOptionWithDescription } from '@/ui/input/types/SelectOptionWithDescription';
import { filterSelectOptionsBySearch } from '@/ui/input/utils/filterSelectOptionsBySearch';
import { normalizeSearchText } from 'twenty-ui/utilities';

type SelectInputProps = {
  onOptionSelected: (selectedOption: SelectOptionWithDescription) => void;
  options: SelectOptionWithDescription[];
  value?: string | null;
  onClear?: () => void;
  clearLabel?: string;
  onAddSelectOption?: (optionName: string) => void;
};

export const SelectInput = ({
  onOptionSelected,
  onClear,
  clearLabel,
  options,
  value,
  onAddSelectOption,
}: SelectInputProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const isSearching = isNonEmptyString(searchFilter.trim());
  const filteredOptions = filterSelectOptionsBySearch({
    options,
    searchFilter,
  });
  const selectedOption = filteredOptions.find(
    (option) => option.value === value,
  );
  const optionsInDropdown = isDefined(selectedOption)
    ? [
        selectedOption,
        ...filteredOptions.filter(
          (option) => option.value !== selectedOption.value,
        ),
      ]
    : filteredOptions;
  const emptyLabel = isNonEmptyString(clearLabel) ? t`No ${clearLabel}` : '';
  const shouldShowClearOption =
    isDefined(onClear) &&
    isNonEmptyString(clearLabel) &&
    normalizeSearchText(emptyLabel).includes(normalizeSearchText(searchFilter));

  const clearOptionItem = shouldShowClearOption ? (
    <Dropdown.OptionItem
      onSelect={onClear}
      selected={!isNonEmptyString(value)}
      closeOnSelect={false}
    >
      <Tag color="transparent" borderStyle="dashed" variant="outline">
        {emptyLabel}
      </Tag>
    </Dropdown.OptionItem>
  ) : null;

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
        {!isSearching && clearOptionItem}
        {optionsInDropdown.map((option) => (
          <SelectOptionDescriptionTooltip
            key={option.value}
            description={option.description}
          >
            <Dropdown.OptionItem
              onSelect={() => onOptionSelected(option)}
              selected={option.value === value}
              closeOnSelect={false}
            >
              <Tag
                color={option.color ?? 'transparent'}
                startIcon={
                  isDefined(option.Icon)
                    ? createElement(option.Icon)
                    : undefined
                }
              >
                {option.label}
              </Tag>
            </Dropdown.OptionItem>
          </SelectOptionDescriptionTooltip>
        ))}
        {isSearching && clearOptionItem}
        {!shouldShowClearOption && !isNonEmptyArray(optionsInDropdown) && (
          <Dropdown.Empty>{t`No option found`}</Dropdown.Empty>
        )}
      </Dropdown.Section>
      <AddSelectOptionDropdownSection
        searchFilter={searchFilter}
        filteredOptions={filteredOptions}
        onAddSelectOption={onAddSelectOption}
      />
    </>
  );
};

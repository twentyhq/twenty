import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { createElement, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type SelectInputProps = {
  onOptionSelected: (selectedOption: SelectOption) => void;
  options: SelectOption[];
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
  const trimmedSearchFilter = searchFilter.trim();
  const isSearching = isNonEmptyString(trimmedSearchFilter);
  const searchTerm = normalizeSearchText(searchFilter);
  const filteredOptions = options.filter((option) =>
    normalizeSearchText(option.label).includes(searchTerm),
  );
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
    normalizeSearchText(emptyLabel).includes(searchTerm);
  const shouldShowAddOption =
    isDefined(onAddSelectOption) &&
    isSearching &&
    !isNonEmptyArray(filteredOptions);

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
          <Dropdown.OptionItem
            key={option.value}
            onSelect={() => onOptionSelected(option)}
            selected={option.value === value}
            closeOnSelect={false}
          >
            <Tag
              color={option.color ?? 'transparent'}
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
        {isSearching && clearOptionItem}
        {!shouldShowClearOption && !isNonEmptyArray(optionsInDropdown) && (
          <Dropdown.Empty>{t`No option found`}</Dropdown.Empty>
        )}
      </Dropdown.Section>
      {shouldShowAddOption && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section>
            <Dropdown.ActionItem
              onClick={() => onAddSelectOption(trimmedSearchFilter)}
              closeOnClick={false}
              startIcon={<IconPlus />}
            >
              {t`Add "${trimmedSearchFilter}" to options`}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </>
      )}
    </>
  );
};

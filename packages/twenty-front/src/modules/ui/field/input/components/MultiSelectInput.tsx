import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { AddSelectOptionDropdownSection } from '@/ui/input/components/AddSelectOptionDropdownSection';
import { filterSelectOptionsBySearch } from '@/ui/input/utils/filterSelectOptionsBySearch';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { createElement, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type MultiSelectInputProps = {
  values: FieldMultiSelectValue;
  options: SelectOption[];
  onOptionSelected: (value: FieldMultiSelectValue) => void;
  onEnter?: () => void;
  onAddSelectOption?: (optionName: string) => void;
};

export const MultiSelectInput = ({
  values,
  options,
  onOptionSelected,
  onAddSelectOption,
  onEnter,
}: MultiSelectInputProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const filteredOptions = filterSelectOptionsBySearch({
    options,
    searchFilter,
  });
  const selectedValues = options
    .filter((option) => values?.includes(option.value))
    .map((option) => option.value);

  const toggleOption = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((selectedValue) => selectedValue !== value)
      : [value, ...selectedValues];

    onOptionSelected(newValues);
  };

  return (
    <>
      <Dropdown.Search
        value={searchFilter}
        onValueChange={(value) =>
          setSearchFilter(turnIntoEmptyStringIfWhitespacesOnly(value))
        }
        onKeyDown={(event) => {
          const shouldSubmit =
            event.key === Key.Enter &&
            !isKeyboardEventComposing(event.nativeEvent) &&
            !isNonEmptyString(searchFilter) &&
            isDefined(onEnter);

          if (shouldSubmit) {
            event.preventDefault();
            onEnter();
          }
        }}
        placeholder={t`Search`}
        aria-label={t`Search`}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {filteredOptions.map((option) => (
          <Dropdown.OptionItem
            key={option.value}
            onSelect={() => toggleOption(option.value)}
            selected={values?.includes(option.value) ?? false}
            closeOnSelect={false}
            indicator="checkbox"
          >
            <Tag
              color={option.color ?? 'transparent'}
              startIcon={
                isDefined(option.Icon) ? createElement(option.Icon) : undefined
              }
            >
              {option.label}
            </Tag>
          </Dropdown.OptionItem>
        ))}
        {!isNonEmptyArray(filteredOptions) && (
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

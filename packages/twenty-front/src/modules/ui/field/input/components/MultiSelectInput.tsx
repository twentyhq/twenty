import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { createElement, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
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
  const searchTerm = normalizeSearchText(searchFilter);
  const filteredOptions = options.filter((option) =>
    normalizeSearchText(option.label).includes(searchTerm),
  );
  const selectedValues = options
    .filter((option) => values?.includes(option.value))
    .map((option) => option.value);

  const toggleOption = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((selectedValue) => selectedValue !== value)
      : [value, ...selectedValues];

    onOptionSelected(newValues);
  };

  const trimmedSearchFilter = searchFilter.trim();
  const shouldShowAddOption =
    isDefined(onAddSelectOption) &&
    isNonEmptyString(trimmedSearchFilter) &&
    !isNonEmptyArray(filteredOptions);

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
            !event.nativeEvent.isComposing &&
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

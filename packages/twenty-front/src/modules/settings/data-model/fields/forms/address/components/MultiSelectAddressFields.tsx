import { SelectControl } from '@/ui/input/components/SelectControl';
import { type SelectSizeVariant } from '@/ui/input/components/Select';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type SelectValue } from '@/ui/input/components/internal/select/types';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type MouseEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  Icon?: IconComponent;
};

type MultiSelectAddressFieldsProps<TValue extends SelectValue> = {
  className?: string;
  disabled?: boolean;
  selectSizeVariant?: SelectSizeVariant;
  dropdownWidth?: number;
  onChange?: (values: TValue[]) => void;
  options: SelectOption<TValue>[];
  values: TValue[];
  callToActionButton?: CallToActionButton;
};

export const MultiSelectAddressFields = <TValue extends SelectValue>({
  className,
  disabled = false,
  selectSizeVariant,
  dropdownWidth,
  onChange,
  options,
  values,
  callToActionButton,
}: MultiSelectAddressFieldsProps<TValue>) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const filteredOptions = isNonEmptyString(searchInputValue)
    ? options.filter(({ label }) =>
        label.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

  const handleOptionSelected = (value: TValue) => {
    const nextValues = values.includes(value)
      ? values.filter((selectedValue) => selectedValue !== value)
      : [...values, value];

    onChange?.(nextValues);
  };

  return (
    <DropdownRoot
      kind="picker"
      multiple
      onOpenChange={(open) => {
        if (!open) {
          setSearchInputValue('');
        }
      }}
    >
      <Dropdown.Trigger
        className={className}
        render={<div />}
        nativeButton={false}
        disabled={disabled}
        aria-label={t`Select address fields`}
      >
        <SelectControl
          selectedOption={{
            label:
              values.length === options.length
                ? t`Default`
                : values.length.toString(),
            value: values.length,
          }}
          selectSizeVariant={selectSizeVariant}
          isDisabled={disabled}
        />
      </Dropdown.Trigger>
      <Dropdown.Content
        width={dropdownWidth}
        sideOffset={0}
        align="end"
        aria-label={t`Select address fields`}
      >
        <Dropdown.Search
          value={searchInputValue}
          onValueChange={setSearchInputValue}
          aria-label={t`Search address fields`}
          placeholder={t`Search`}
        />
        <Dropdown.Separator />
        <Dropdown.Section>
          {filteredOptions.map((option) => (
            <Dropdown.OptionItem
              key={`${option.value}`}
              selected={values.includes(option.value)}
              onSelect={() => handleOptionSelected(option.value)}
              disabled={option.disabled}
            >
              <Tag color="transparent">{option.label}</Tag>
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
        {isDefined(callToActionButton) && (
          <>
            <Dropdown.Separator />
            <Dropdown.Section>
              <Dropdown.ActionItem
                onClick={callToActionButton.onClick}
                startIcon={<SelectOptionIcon Icon={callToActionButton.Icon} />}
                disabled={values.length === options.length}
              >
                {callToActionButton.text}
              </Dropdown.ActionItem>
            </Dropdown.Section>
          </>
        )}
      </Dropdown.Content>
    </DropdownRoot>
  );
};

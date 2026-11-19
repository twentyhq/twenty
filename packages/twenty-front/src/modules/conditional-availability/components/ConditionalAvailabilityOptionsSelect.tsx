import { ConditionalAvailabilityValueControl } from '@/conditional-availability/components/ConditionalAvailabilityValueControl';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityValueOption } from '@/conditional-availability/types/ConditionalAvailabilityValueOption';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { normalizeSearchText } from 'twenty-ui/utilities';

type ConditionalAvailabilityOptionsSelectProps = {
  dropdownId: string;
  options: ConditionalAvailabilityValueOption[];
  values: string[];
  getUnknownValueLabel: (value: string) => string;
  isMultiple: boolean;
  searchPlaceholder: string | null;
  placeholder: string;
  isLoading?: boolean;
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityOptionsSelect = ({
  dropdownId,
  options,
  values,
  getUnknownValueLabel,
  isMultiple,
  searchPlaceholder,
  placeholder,
  isLoading = false,
  onChange,
}: ConditionalAvailabilityOptionsSelectProps) => {
  const { t } = useLingui();
  const { isReadOnly } = useConditionalAvailabilityEditorContext();
  const [searchValue, setSearchValue] = useState('');

  const getValueLabel = (value: string) =>
    options.find((option) => option.value === value)?.label ??
    getUnknownValueLabel(value);

  const control = (
    <ConditionalAvailabilityValueControl
      labels={values.map(getValueLabel)}
      placeholder={placeholder}
      isDisabled={isReadOnly}
    />
  );

  if (isReadOnly) {
    return control;
  }

  const optionValues = options.map((option) => option.value);

  const unknownValueOptions: ConditionalAvailabilityValueOption[] = values
    .filter((value) => !optionValues.includes(value))
    .map((value) => ({ value, label: getValueLabel(value) }));

  const normalizedSearchValue = normalizeSearchText(searchValue);

  const matchingOptions = [...options, ...unknownValueOptions].filter(
    (option) =>
      normalizeSearchText(option.label).includes(normalizedSearchValue),
  );

  const handleMultipleValuesChange = (nextValues: string[]) => {
    const keptValues = values.filter((value) => nextValues.includes(value));
    const addedValues = nextValues.filter((value) => !values.includes(value));

    onChange([...keptValues, ...addedValues]);
  };

  const handleSingleValueChange = (nextValue: string | null) => {
    onChange(isDefined(nextValue) ? [nextValue] : []);
  };

  const renderOptions = () =>
    matchingOptions.map((option) => (
      <Dropdown.OptionItem
        key={option.value}
        value={option.value}
        indicator={isMultiple ? 'checkbox' : 'check'}
        startIcon={option.startIcon}
      >
        {option.label}
      </Dropdown.OptionItem>
    ));

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setSearchValue('');
        }
      }}
    >
      <Dropdown.Trigger nativeButton={false} render={<div />}>
        {control}
      </Dropdown.Trigger>
      <DropdownContent
        width={GenericDropdownContentWidth.Large}
        align="start"
        sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
      >
        {isDefined(searchPlaceholder) && (
          <Dropdown.Search
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        )}
        {isDefined(searchPlaceholder) &&
          (isLoading || isNonEmptyArray(matchingOptions)) && (
            <Dropdown.Separator />
          )}
        {isLoading ? (
          <Dropdown.Loading />
        ) : !isNonEmptyArray(matchingOptions) ? (
          <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
        ) : isMultiple ? (
          <Dropdown.SelectionGroup
            aria-label={placeholder}
            multiple
            value={values}
            onValueChange={handleMultipleValuesChange}
          >
            <Dropdown.Section scrollable>{renderOptions()}</Dropdown.Section>
          </Dropdown.SelectionGroup>
        ) : (
          <Dropdown.SelectionGroup
            aria-label={placeholder}
            value={values[0] ?? null}
            onValueChange={handleSingleValueChange}
          >
            <Dropdown.Section scrollable>{renderOptions()}</Dropdown.Section>
          </Dropdown.SelectionGroup>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};

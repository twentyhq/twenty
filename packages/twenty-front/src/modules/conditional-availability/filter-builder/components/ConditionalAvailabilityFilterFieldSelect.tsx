import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { useUpdateConditionalAvailabilityFilterSettings } from '@/conditional-availability/filter-builder/hooks/useUpdateConditionalAvailabilityFilterSettings';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { createEmptyConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/createEmptyConditionalAvailabilityFilter';
import { updateConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilter';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useTheme } from 'twenty-ui/theme';

type ConditionalAvailabilityFilterFieldSelectProps = {
  filterFields: ConditionalAvailabilityFilterField[];
  filter: ConditionalAvailabilityFilter;
};

export const ConditionalAvailabilityFilterFieldSelect = ({
  filterFields,
  filter,
}: ConditionalAvailabilityFilterFieldSelectProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();
  const { updateConditionalAvailabilityFilterSettings } =
    useUpdateConditionalAvailabilityFilterSettings();
  const [searchInput, setSearchInput] = useState('');

  const selectedField = filterFields.find(({ key }) => key === filter.variable);

  const control = (
    <SelectControl
      selectedOption={{
        value: filter.variable,
        label: isDefined(selectedField) ? t(selectedField.label) : '',
        Icon: selectedField?.Icon,
      }}
      isDisabled={readonly}
    />
  );

  if (readonly) {
    return control;
  }

  const doesFieldMatchSearch = (field: ConditionalAvailabilityFilterField) =>
    t(field.label)
      .toLocaleLowerCase()
      .includes(searchInput.trim().toLocaleLowerCase());

  const currentUserFields = filterFields.filter(
    (field) => field.key !== 'device' && doesFieldMatchSearch(field),
  );
  const deviceFields = filterFields.filter(
    (field) => field.key === 'device' && doesFieldMatchSearch(field),
  );

  const handleFieldChange = (fieldKey: string | null) => {
    const field = filterFields.find(({ key }) => key === fieldKey);

    if (!isDefined(field)) {
      return;
    }

    updateConditionalAvailabilityFilterSettings(
      (currentConditionalAvailabilityFilterGroup) =>
        updateConditionalAvailabilityFilter({
          filterGroup: currentConditionalAvailabilityFilterGroup,
          filterId: filter.id,
          update: (filterToUpdate) => ({
            ...createEmptyConditionalAvailabilityFilter({
              variable: field.key,
            }),
            id: filterToUpdate.id,
          }),
        }),
    );
  };

  const renderFieldOption = (field: ConditionalAvailabilityFilterField) => (
    <Dropdown.OptionItem
      key={field.key}
      value={field.key}
      startIcon={<field.Icon size={theme.icon.size.md} />}
    >
      {t(field.label)}
    </Dropdown.OptionItem>
  );

  return (
    <DropdownRoot
      dropdownId={`conditional-availability-filter-field-${filter.id}`}
      type="picker"
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setSearchInput('');
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
        <Dropdown.Search
          value={searchInput}
          onValueChange={setSearchInput}
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
        />
        <Dropdown.Separator />
        <Dropdown.SelectionGroup
          aria-label={t`Field`}
          value={filter.variable}
          onValueChange={handleFieldChange}
        >
          <Dropdown.Section scrollable>
            {isNonEmptyArray(currentUserFields) && (
              <Dropdown.Section label={t`Current user`}>
                {currentUserFields.map(renderFieldOption)}
              </Dropdown.Section>
            )}
            {isNonEmptyArray(currentUserFields) &&
              isNonEmptyArray(deviceFields) && <Dropdown.Separator />}
            {isNonEmptyArray(deviceFields) && (
              <Dropdown.Section label={t`Device`}>
                {deviceFields.map(renderFieldOption)}
              </Dropdown.Section>
            )}
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
      </DropdownContent>
    </DropdownRoot>
  );
};

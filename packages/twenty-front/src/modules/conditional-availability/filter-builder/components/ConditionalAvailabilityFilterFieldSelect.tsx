import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { useUpdateConditionalAvailabilityFilterSettings } from '@/conditional-availability/filter-builder/hooks/useUpdateConditionalAvailabilityFilterSettings';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { createEmptyConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/createEmptyConditionalAvailabilityFilter';
import { createEmptyConditionalAvailabilityFilterOnField } from '@/conditional-availability/filter-builder/utils/createEmptyConditionalAvailabilityFilterOnField';
import { findConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/utils/findConditionalAvailabilityFilterField';
import { getConditionalAvailabilityFilterFieldKey } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterFieldKey';
import { updateConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilter';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useState } from 'react';
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

  const getFieldLabel = (field: ConditionalAvailabilityFilterField) =>
    'field' in field ? field.label : t(field.label);

  const selectedField = findConditionalAvailabilityFilterField({
    filterFields,
    filter,
  });
  const selectedFieldKey = isDefined(selectedField)
    ? getConditionalAvailabilityFilterFieldKey({ filterField: selectedField })
    : null;

  const control = (
    <SelectControl
      selectedOption={{
        value: selectedFieldKey,
        label: isDefined(selectedField)
          ? getFieldLabel(selectedField)
          : t`Unknown field`,
        Icon: selectedField?.Icon,
      }}
      isDisabled={readonly}
    />
  );

  if (readonly) {
    return control;
  }

  const matchingFields = filterFields.filter((field) =>
    getFieldLabel(field)
      .toLocaleLowerCase()
      .includes(searchInput.trim().toLocaleLowerCase()),
  );

  const recordFields = matchingFields.flatMap((field) =>
    'field' in field ? [field] : [],
  );
  const [firstRecordField] = recordFields;

  const sections = [
    {
      label: t`Current user`,
      fields: matchingFields.filter(
        (field) => 'key' in field && field.key !== 'device',
      ),
    },
    {
      label: t`Device`,
      fields: matchingFields.filter(
        (field) => 'key' in field && field.key === 'device',
      ),
    },
    {
      label: firstRecordField?.objectLabelSingular ?? '',
      fields: recordFields,
    },
  ].filter(({ fields }) => isNonEmptyArray(fields));

  const handleFieldChange = (fieldKey: string | null) => {
    const field = filterFields.find(
      (filterField) =>
        getConditionalAvailabilityFilterFieldKey({ filterField }) === fieldKey,
    );

    if (!isDefined(field)) {
      return;
    }

    const emptyFilter =
      'field' in field
        ? createEmptyConditionalAvailabilityFilterOnField({
            field: field.field,
          })
        : createEmptyConditionalAvailabilityFilter({ variable: field.key });

    updateConditionalAvailabilityFilterSettings(
      (currentConditionalAvailabilityFilterGroup) =>
        updateConditionalAvailabilityFilter({
          filterGroup: currentConditionalAvailabilityFilterGroup,
          filterId: filter.id,
          update: (filterToUpdate) => ({
            ...emptyFilter,
            id: filterToUpdate.id,
          }),
        }),
    );
  };

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
          value={selectedFieldKey}
          onValueChange={handleFieldChange}
        >
          <Dropdown.Section scrollable>
            {sections.map((section, sectionIndex) => (
              <Fragment key={section.label}>
                {sectionIndex > 0 && <Dropdown.Separator />}
                <Dropdown.Section label={section.label}>
                  {section.fields.map((field) => {
                    const fieldKey = getConditionalAvailabilityFilterFieldKey({
                      filterField: field,
                    });

                    return (
                      <Dropdown.OptionItem
                        key={fieldKey}
                        value={fieldKey}
                        startIcon={<field.Icon size={theme.icon.size.md} />}
                      >
                        {getFieldLabel(field)}
                      </Dropdown.OptionItem>
                    );
                  })}
                </Dropdown.Section>
              </Fragment>
            ))}
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
      </DropdownContent>
    </DropdownRoot>
  );
};

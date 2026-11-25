import { CONDITIONAL_AVAILABILITY_FILTER_VARIABLES } from '@/conditional-availability/filter-builder/constants/ConditionalAvailabilityFilterVariables';
import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { createEmptyConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/createEmptyConditionalAvailabilityFilter';
import { getConditionalAvailabilityFilterVariableIcon } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariableIcon';
import { getConditionalAvailabilityFilterVariableLabel } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariableLabel';
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

type ConditionalAvailabilityFilterVariableSelectProps = {
  filter: ConditionalAvailabilityFilter;
};

export const ConditionalAvailabilityFilterVariableSelect = ({
  filter,
}: ConditionalAvailabilityFilterVariableSelectProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { rootFilterGroup, onRootFilterGroupChange, isReadOnly } =
    useConditionalAvailabilityFilterBuilderContextOrThrow();
  const [searchInput, setSearchInput] = useState('');

  const control = (
    <SelectControl
      selectedOption={{
        value: filter.variable,
        label: getConditionalAvailabilityFilterVariableLabel({
          variable: filter.variable,
        }),
        Icon: getConditionalAvailabilityFilterVariableIcon({
          variable: filter.variable,
        }),
      }}
      isDisabled={isReadOnly}
    />
  );

  if (isReadOnly) {
    return control;
  }

  const doesVariableMatchSearch = (
    variable: ConditionalAvailabilityFilterVariable,
  ) =>
    getConditionalAvailabilityFilterVariableLabel({ variable })
      .toLocaleLowerCase()
      .includes(searchInput.trim().toLocaleLowerCase());

  const currentUserVariables = CONDITIONAL_AVAILABILITY_FILTER_VARIABLES.filter(
    (variable) => variable !== 'device' && doesVariableMatchSearch(variable),
  );
  const deviceVariables = CONDITIONAL_AVAILABILITY_FILTER_VARIABLES.filter(
    (variable) => variable === 'device' && doesVariableMatchSearch(variable),
  );

  const handleVariableChange = (nextVariable: string | null) => {
    const selectedVariable = CONDITIONAL_AVAILABILITY_FILTER_VARIABLES.find(
      (variable) => variable === nextVariable,
    );

    if (!isDefined(selectedVariable)) {
      return;
    }

    onRootFilterGroupChange(
      updateConditionalAvailabilityFilter({
        filterGroup: rootFilterGroup,
        filterId: filter.id,
        update: (filterToUpdate) => ({
          ...createEmptyConditionalAvailabilityFilter({
            variable: selectedVariable,
          }),
          id: filterToUpdate.id,
        }),
      }),
    );
  };

  const renderVariableOption = (
    variable: ConditionalAvailabilityFilterVariable,
  ) => {
    const VariableIcon = getConditionalAvailabilityFilterVariableIcon({
      variable,
    });

    return (
      <Dropdown.OptionItem
        key={variable}
        value={variable}
        startIcon={<VariableIcon size={theme.icon.size.md} />}
      >
        {getConditionalAvailabilityFilterVariableLabel({ variable })}
      </Dropdown.OptionItem>
    );
  };

  return (
    <DropdownRoot
      dropdownId={`conditional-availability-filter-variable-${filter.id}`}
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
          onValueChange={handleVariableChange}
        >
          <Dropdown.Section scrollable>
            {isNonEmptyArray(currentUserVariables) && (
              <Dropdown.Section label={t`Current user`}>
                {currentUserVariables.map(renderVariableOption)}
              </Dropdown.Section>
            )}
            {isNonEmptyArray(currentUserVariables) &&
              isNonEmptyArray(deviceVariables) && <Dropdown.Separator />}
            {isNonEmptyArray(deviceVariables) && (
              <Dropdown.Section label={t`Device`}>
                {deviceVariables.map(renderVariableOption)}
              </Dropdown.Section>
            )}
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
      </DropdownContent>
    </DropdownRoot>
  );
};

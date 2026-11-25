import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { canConditionalAvailabilityFilterOperatorHoldSeveralValues } from '@/conditional-availability/filter-builder/utils/canConditionalAvailabilityFilterOperatorHoldSeveralValues';
import { getConditionalAvailabilityDeviceLabel } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityDeviceLabel';
import { updateConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilter';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { StyledControlContainer } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { CONDITIONAL_EVALUATION_DEVICES } from 'twenty-shared/conditional-evaluation';
import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { normalizeSearchText } from 'twenty-ui/utilities';

const StyledChips = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledIconChevronDownWrapper = styled.div<{ isDisabled: boolean }>`
  color: ${({ isDisabled }) =>
    isDisabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

type ConditionalAvailabilityFilterValueInputProps = {
  filter: ConditionalAvailabilityFilter;
};

export const ConditionalAvailabilityFilterValueInput = ({
  filter,
}: ConditionalAvailabilityFilterValueInputProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const {
    rootFilterGroup,
    onRootFilterGroupChange,
    roleOptions,
    workspaceMemberOptions,
    isReadOnly,
  } = useConditionalAvailabilityFilterBuilderContextOrThrow();
  const [searchValue, setSearchValue] = useState('');

  const canHoldSeveralValues =
    canConditionalAvailabilityFilterOperatorHoldSeveralValues({
      operator: filter.operator,
    });

  const getVariableValueSettings = (): {
    options: SelectOption<string>[];
    placeholder: string;
    searchPlaceholder: string | null;
    unknownValueLabel: string | null;
  } => {
    switch (filter.variable) {
      case 'currentRole':
        return {
          options: roleOptions,
          placeholder: t`Select roles`,
          searchPlaceholder: t`Search roles`,
          unknownValueLabel: t`Deleted role`,
        };
      case 'currentWorkspaceMember':
        return {
          options: workspaceMemberOptions,
          placeholder: canHoldSeveralValues
            ? t`Select members`
            : t`Select a member`,
          searchPlaceholder: t`Search members`,
          unknownValueLabel: t`Unknown member`,
        };
      case 'device':
        return {
          options: CONDITIONAL_EVALUATION_DEVICES.map((device) => ({
            value: device,
            label: getConditionalAvailabilityDeviceLabel({ device }),
          })),
          placeholder: t`Select a device`,
          searchPlaceholder: null,
          unknownValueLabel: null,
        };
      default:
        return assertUnreachable(filter.variable);
    }
  };

  const { options, placeholder, searchPlaceholder, unknownValueLabel } =
    getVariableValueSettings();

  const getValueLabel = (value: string) =>
    options.find((option) => option.value === value)?.label ??
    unknownValueLabel ??
    value;

  const hasValues = isNonEmptyArray(filter.values);

  const control = (
    <StyledControlContainer
      disabled={isReadOnly}
      hasIcon={false}
      textAccent={hasValues ? 'default' : 'placeholder'}
    >
      {hasValues ? (
        <StyledChips>
          {filter.values.map((value) => (
            <Chip key={value} variant="soft">
              {getValueLabel(value)}
            </Chip>
          ))}
        </StyledChips>
      ) : (
        <OverflowingTextWithTooltip text={placeholder} />
      )}
      <StyledIconChevronDownWrapper isDisabled={isReadOnly}>
        <IconChevronDown size={theme.icon.size.md} />
      </StyledIconChevronDownWrapper>
    </StyledControlContainer>
  );

  if (isReadOnly) {
    return control;
  }

  const unknownValueOptions: SelectOption<string>[] = filter.values
    .filter((value) => !options.some((option) => option.value === value))
    .map((value) => ({ value, label: getValueLabel(value) }));

  const normalizedSearchValue = normalizeSearchText(searchValue);

  const matchingOptions = [...options, ...unknownValueOptions].filter(
    (option) =>
      normalizeSearchText(option.label).includes(normalizedSearchValue),
  );

  const handleValuesChange = (values: string[]) => {
    onRootFilterGroupChange(
      updateConditionalAvailabilityFilter({
        filterGroup: rootFilterGroup,
        filterId: filter.id,
        update: (filterToUpdate) => ({ ...filterToUpdate, values }),
      }),
    );
  };

  const handleSingleValueChange = (nextValue: string | null) => {
    handleValuesChange(isDefined(nextValue) ? [nextValue] : []);
  };

  const renderOptionList = () => {
    if (!isNonEmptyArray(matchingOptions)) {
      return <Dropdown.Empty>{t`No results`}</Dropdown.Empty>;
    }

    const optionItems = (
      <Dropdown.Section scrollable>
        {matchingOptions.map((option) => (
          <Dropdown.OptionItem
            key={option.value}
            value={option.value}
            startIcon={option.LeftComponent}
          >
            {option.label}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    );

    if (canHoldSeveralValues) {
      return (
        <Dropdown.SelectionGroup
          aria-label={placeholder}
          multiple
          value={filter.values}
          onValueChange={handleValuesChange}
        >
          {optionItems}
        </Dropdown.SelectionGroup>
      );
    }

    return (
      <Dropdown.SelectionGroup
        aria-label={placeholder}
        value={filter.values[0] ?? null}
        onValueChange={handleSingleValueChange}
      >
        {optionItems}
      </Dropdown.SelectionGroup>
    );
  };

  return (
    <DropdownRoot
      dropdownId={`conditional-availability-filter-value-${filter.id}`}
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
        {isDefined(searchPlaceholder) && isNonEmptyArray(matchingOptions) && (
          <Dropdown.Separator />
        )}
        {renderOptionList()}
      </DropdownContent>
    </DropdownRoot>
  );
};

import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { useUpdateConditionalAvailabilityFilterSettings } from '@/conditional-availability/filter-builder/hooks/useUpdateConditionalAvailabilityFilterSettings';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { canConditionalAvailabilityFilterOperatorHoldSeveralValues } from '@/conditional-availability/filter-builder/utils/canConditionalAvailabilityFilterOperatorHoldSeveralValues';
import { updateConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilter';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { StyledControlContainer } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
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
  filterFields: ConditionalAvailabilityFilterField[];
  filter: ConditionalAvailabilityFilter;
};

export const ConditionalAvailabilityFilterValueInput = ({
  filterFields,
  filter,
}: ConditionalAvailabilityFilterValueInputProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();
  const { updateConditionalAvailabilityFilterSettings } =
    useUpdateConditionalAvailabilityFilterSettings();
  const [searchValue, setSearchValue] = useState('');

  const canHoldSeveralValues =
    canConditionalAvailabilityFilterOperatorHoldSeveralValues({
      operator: filter.operator,
    });

  const getVariableValueSettings = (): {
    placeholder: string;
    searchPlaceholder: string | null;
    unknownValueLabel: string | null;
  } => {
    switch (filter.variable) {
      case 'currentRole':
        return {
          placeholder: t`Select roles`,
          searchPlaceholder: t`Search roles`,
          unknownValueLabel: t`Deleted role`,
        };
      case 'currentWorkspaceMember':
        return {
          placeholder: canHoldSeveralValues
            ? t`Select members`
            : t`Select a member`,
          searchPlaceholder: t`Search members`,
          unknownValueLabel: t`Unknown member`,
        };
      case 'device':
        return {
          placeholder: t`Select a device`,
          searchPlaceholder: null,
          unknownValueLabel: null,
        };
      default:
        return assertUnreachable(filter.variable);
    }
  };

  const { placeholder, searchPlaceholder, unknownValueLabel } =
    getVariableValueSettings();

  const options =
    filterFields.find(({ key }) => key === filter.variable)?.options ?? [];

  const getValueLabel = (value: string) =>
    options.find((option) => option.value === value)?.label ??
    unknownValueLabel ??
    value;

  const hasValues = isNonEmptyArray(filter.values);

  const control = (
    <StyledControlContainer
      disabled={readonly}
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
      <StyledIconChevronDownWrapper isDisabled={readonly}>
        <IconChevronDown size={theme.icon.size.md} />
      </StyledIconChevronDownWrapper>
    </StyledControlContainer>
  );

  if (readonly) {
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
    updateConditionalAvailabilityFilterSettings(
      (currentConditionalAvailabilityFilterGroup) =>
        updateConditionalAvailabilityFilter({
          filterGroup: currentConditionalAvailabilityFilterGroup,
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

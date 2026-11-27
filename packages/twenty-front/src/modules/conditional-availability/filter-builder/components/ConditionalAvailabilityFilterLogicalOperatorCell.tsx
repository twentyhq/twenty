import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { useUpdateConditionalAvailabilityFilterSettings } from '@/conditional-availability/filter-builder/hooks/useUpdateConditionalAvailabilityFilterSettings';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { getConditionalAvailabilityLogicalOperatorLabel } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityLogicalOperatorLabel';
import { updateConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilterGroup';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  type ConditionalEvaluationLogicalOperator,
  conditionalEvaluationLogicalOperatorSchema,
} from 'twenty-shared/conditional-evaluation';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledText = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  height: ${themeCssVariables.spacing[8]};
`;

const StyledContainer = styled.div`
  align-items: start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  min-width: ${themeCssVariables.spacing[20]};
`;

type ConditionalAvailabilityFilterLogicalOperatorCellProps = {
  index: number;
  filterGroup: ConditionalAvailabilityFilterGroup;
};

export const ConditionalAvailabilityFilterLogicalOperatorCell = ({
  index,
  filterGroup,
}: ConditionalAvailabilityFilterLogicalOperatorCellProps) => {
  const { t } = useLingui();
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();
  const { updateConditionalAvailabilityFilterSettings } =
    useUpdateConditionalAvailabilityFilterSettings();

  if (index === 0) {
    return (
      <StyledContainer>
        <StyledText>{t`Where`}</StyledText>
      </StyledContainer>
    );
  }

  if (index > 1) {
    return (
      <StyledContainer>
        <StyledText>
          {getConditionalAvailabilityLogicalOperatorLabel({
            logicalOperator: filterGroup.logicalOperator,
          })}
        </StyledText>
      </StyledContainer>
    );
  }

  const logicalOperatorOptions =
    conditionalEvaluationLogicalOperatorSchema.options.map(
      (logicalOperator) => ({
        value: logicalOperator,
        label: getConditionalAvailabilityLogicalOperatorLabel({
          logicalOperator,
        }),
      }),
    );

  const handleLogicalOperatorChange = (
    logicalOperator: ConditionalEvaluationLogicalOperator,
  ) => {
    updateConditionalAvailabilityFilterSettings(
      (currentConditionalAvailabilityFilterGroup) =>
        updateConditionalAvailabilityFilterGroup({
          filterGroup: currentConditionalAvailabilityFilterGroup,
          filterGroupId: filterGroup.id,
          update: (filterGroupToUpdate) => ({
            ...filterGroupToUpdate,
            logicalOperator,
          }),
        }),
    );
  };

  return (
    <StyledContainer>
      <Select
        dropdownWidth={GenericDropdownContentWidth.Narrow}
        dropdownId={`conditional-availability-filter-logical-operator-${filterGroup.id}`}
        value={filterGroup.logicalOperator}
        onChange={handleLogicalOperatorChange}
        options={logicalOperatorOptions}
        dropdownSideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
        disabled={readonly}
      />
    </StyledContainer>
  );
};

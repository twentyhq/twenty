import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo } from 'react';
import { StepLogicalOperator, type StepFilterGroup } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledText = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  height: ${themeCssVariables.spacing[8]};
`;

const StyledNumber = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  margin-right: ${themeCssVariables.spacing[1]};
`;

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  min-width: ${themeCssVariables.spacing[20]};
  color: ${themeCssVariables.font.color.tertiary};
`;

type WorkflowStepFilterLogicalOperatorCellProps = {
  index: number;
  stepFilterGroup: StepFilterGroup;
  firstFilterLabel?: string;
  elseIfIndex?: number;
};

export const WorkflowStepFilterLogicalOperatorCell = ({
  index,
  stepFilterGroup,
  firstFilterLabel,
  elseIfIndex,
}: WorkflowStepFilterLogicalOperatorCellProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);
  const { t } = useLingui();
  const defaultFirstFilterLabel = t`Where`;

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const stepFilterLogicalOperatorOptions = useMemo(
    () => [
      {
        value: StepLogicalOperator.AND,
        label: t`And`,
      },
      {
        value: StepLogicalOperator.OR,
        label: t`Or`,
      },
    ],
    [t],
  );

  const handleChange = (value: StepLogicalOperator) => {
    upsertStepFilterSettings({
      stepFilterGroupToUpsert: {
        id: stepFilterGroup.id,
        parentStepFilterGroupId: stepFilterGroup.parentStepFilterGroupId,
        positionInStepFilterGroup: stepFilterGroup.positionInStepFilterGroup,
        logicalOperator: value,
      },
    });
  };

  return (
    <StyledContainer>
      {index === 0 ? (
        <StyledText>
          {isDefined(elseIfIndex) && <StyledNumber>{elseIfIndex}</StyledNumber>}
          {firstFilterLabel ?? defaultFirstFilterLabel}
        </StyledText>
      ) : index === 1 ? (
        readonly ? (
          <Select
            dropdownWidth={GenericDropdownContentWidth.Narrow}
            dropdownId={`advanced-filter-logical-operator-${stepFilterGroup.id}`}
            value={stepFilterGroup.logicalOperator}
            options={stepFilterLogicalOperatorOptions}
            dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
            disabled
          />
        ) : (
          <Select
            dropdownWidth={GenericDropdownContentWidth.Narrow}
            dropdownId={`advanced-filter-logical-operator-${stepFilterGroup.id}`}
            value={stepFilterGroup.logicalOperator}
            onChange={handleChange}
            options={stepFilterLogicalOperatorOptions}
            dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
          />
        )
      ) : (
        <StyledText>
          {capitalize(stepFilterGroup.logicalOperator.toLowerCase())}
        </StyledText>
      )}
    </StyledContainer>
  );
};

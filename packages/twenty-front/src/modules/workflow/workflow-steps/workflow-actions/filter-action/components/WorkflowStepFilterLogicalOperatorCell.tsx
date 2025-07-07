import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';

import styled from '@emotion/styled';
import { useContext } from 'react';
import { StepFilterGroup, StepLogicalOperator } from 'twenty-shared/src/types';
import { capitalize } from 'twenty-shared/utils';

const StyledText = styled.div`
  height: ${({ theme }) => theme.spacing(8)};
  display: flex;
  align-items: center;
`;

const StyledContainer = styled.div`
  align-items: start;
  display: flex;
  min-width: ${({ theme }) => theme.spacing(20)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type WorkflowStepFilterLogicalOperatorCellProps = {
  index: number;
  stepFilterGroup: StepFilterGroup;
};

const STEP_FILTER_LOGICAL_OPERATOR_OPTIONS = [
  {
    value: StepLogicalOperator.AND,
    label: 'And',
  },
  {
    value: StepLogicalOperator.OR,
    label: 'Or',
  },
];

export const WorkflowStepFilterLogicalOperatorCell = ({
  index,
  stepFilterGroup,
}: WorkflowStepFilterLogicalOperatorCellProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

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
        <StyledText>Where</StyledText>
      ) : index === 1 ? (
        readonly ? (
          <Select
            fullWidth
            dropdownWidth={GenericDropdownContentWidth.Narrow}
            dropdownId={`advanced-filter-logical-operator-${stepFilterGroup.id}`}
            value={stepFilterGroup.logicalOperator}
            options={STEP_FILTER_LOGICAL_OPERATOR_OPTIONS}
            dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
            disabled
          />
        ) : (
          <Select
            fullWidth
            dropdownWidth={GenericDropdownContentWidth.Narrow}
            dropdownId={`advanced-filter-logical-operator-${stepFilterGroup.id}`}
            value={stepFilterGroup.logicalOperator}
            onChange={handleChange}
            options={STEP_FILTER_LOGICAL_OPERATOR_OPTIONS}
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

import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreObjectFilterFieldSelect } from '@/object-core/filters/components/CoreObjectFilterFieldSelect';
import { CoreObjectFilterValueInput } from '@/object-core/filters/components/CoreObjectFilterValueInput';
import { type CoreObjectFilterField } from '@/object-core/filters/types/CoreObjectFilterField';
import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterOperandSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOperandSelect';
import { WorkflowStepFilterOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOptionsDropdown';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';

type CoreObjectFilterColumnProps = {
  filterFields: CoreObjectFilterField[];
  stepFilterGroup: StepFilterGroup;
  stepFilter: StepFilter;
  stepFilterIndex: number;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

export const CoreObjectFilterColumn = ({
  filterFields,
  stepFilterGroup,
  stepFilter,
  stepFilterIndex,
}: CoreObjectFilterColumnProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  return (
    <AdvancedFilterSidePanelColumn>
      <StyledContainer>
        <WorkflowStepFilterLogicalOperatorCell
          index={stepFilterIndex}
          stepFilterGroup={stepFilterGroup}
        />
        {!readonly && (
          <WorkflowStepFilterOptionsDropdown stepFilterId={stepFilter.id} />
        )}
      </StyledContainer>
      <CoreObjectFilterFieldSelect
        filterFields={filterFields}
        stepFilter={stepFilter}
      />
      <WorkflowStepFilterOperandSelect stepFilter={stepFilter} />
      <CoreObjectFilterValueInput
        filterFields={filterFields}
        stepFilter={stepFilter}
      />
    </AdvancedFilterSidePanelColumn>
  );
};

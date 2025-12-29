import { AdvancedFilterCommandMenuColumn } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuColumn';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { WorkflowStepFilterFieldSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterFieldSelect';
import { WorkflowStepFilterLogicalOperatorCell } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterLogicalOperatorCell';
import { WorkflowStepFilterOperandSelect } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOperandSelect';
import { WorkflowStepFilterOptionsDropdown } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterOptionsDropdown';
import { WorkflowStepFilterValueInput } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterValueInput';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import styled from '@emotion/styled';
import { useContext, useMemo } from 'react';
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type WorkflowStepFilterColumnProps = {
  stepFilterGroup: StepFilterGroup;
  stepFilter: StepFilter;
  stepFilterIndex: number;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowStepFilterColumn = ({
  stepFilterGroup,
  stepFilter,
  stepFilterIndex,
}: WorkflowStepFilterColumnProps) => {
  const { readonly, isIfBranch } = useContext(WorkflowStepFilterContext);

  const stepFilters = useRecoilComponentValue(currentStepFiltersComponentState);
  const stepFilterGroups = useRecoilComponentValue(
    currentStepFilterGroupsComponentState,
  );

  const isLastFilterInIfBranch = useMemo(() => {
    if (!isIfBranch || !isDefined(stepFilter)) {
      return false;
    }

    const rootStepFilterGroup = stepFilterGroups?.find(
      (filterGroup) => !isDefined(filterGroup.parentStepFilterGroupId),
    );

    if (!isDefined(rootStepFilterGroup)) {
      return false;
    }

    const filtersInRootGroup = stepFilters?.filter(
      (filter) => filter.stepFilterGroupId === rootStepFilterGroup.id,
    );

    const filterGroupsInRootGroup = stepFilterGroups?.filter(
      (g) => g.parentStepFilterGroupId === rootStepFilterGroup.id,
    );

    return (
      filtersInRootGroup?.length === 1 &&
      (!isDefined(filterGroupsInRootGroup) ||
        filterGroupsInRootGroup.length === 0)
    );
  }, [isIfBranch, stepFilter, stepFilters, stepFilterGroups]);

  const shouldShowDropdown = !readonly && !isLastFilterInIfBranch;

  return (
    <AdvancedFilterCommandMenuColumn>
      <StyledContainer>
        <WorkflowStepFilterLogicalOperatorCell
          index={stepFilterIndex}
          stepFilterGroup={stepFilterGroup}
        />
        {shouldShowDropdown && (
          <WorkflowStepFilterOptionsDropdown stepFilterId={stepFilter.id} />
        )}
      </StyledContainer>
      <WorkflowStepFilterFieldSelect stepFilter={stepFilter} />
      <WorkflowStepFilterOperandSelect stepFilter={stepFilter} />
      <WorkflowStepFilterValueInput stepFilter={stepFilter} />
    </AdvancedFilterCommandMenuColumn>
  );
};

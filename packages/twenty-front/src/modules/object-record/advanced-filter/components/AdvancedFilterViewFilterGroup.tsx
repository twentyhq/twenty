import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRuleOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRuleOptionsDropdown';
import { AdvancedFilterViewFilter } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilter';
import { useUpsertCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useUpsertCombinedViewFilterGroup';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';
import { v4 } from 'uuid';

const StyledRow = styled.div`
  display: flex;
  align-items: start;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div<{ isGrayBackground?: boolean }>`
  background-color: ${({ theme, isGrayBackground }) =>
    isGrayBackground ? theme.background.transparent.lighter : 'transparent'};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

interface AdvancedFilterViewFilterGroupProps {
  parentViewFilterGroupId?: string;
  viewBarInstanceId: string;
}

export const AdvancedFilterViewFilterGroup = (
  props: AdvancedFilterViewFilterGroupProps,
) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { upsertCombinedViewFilterGroup } = useUpsertCombinedViewFilterGroup();
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const viewFilters = currentViewWithCombinedFiltersAndSorts?.viewFilters;
  const viewFilterGroups =
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups;

  const componentViewFilterGroup = viewFilterGroups?.find((viewFilterGroup) =>
    props.parentViewFilterGroupId
      ? viewFilterGroup.parentViewFilterGroupId ===
        props.parentViewFilterGroupId
      : !viewFilterGroup.parentViewFilterGroupId,
  );

  if (!componentViewFilterGroup) {
    throw new Error(
      `Missing component view filter group for view filter group with parent id of '${props.parentViewFilterGroupId}'`,
    );
  }

  const childViewFilters = viewFilters?.filter(
    (viewFilter) =>
      viewFilter.viewFilterGroupId === componentViewFilterGroup.id,
  );

  const childViewFilterGroups = viewFilterGroups?.filter(
    (viewFilterGroup) =>
      viewFilterGroup.parentViewFilterGroupId === componentViewFilterGroup.id,
  );

  const childViewFiltersAndViewFilterGroups = [
    ...(childViewFilterGroups ?? []),
    ...(childViewFilters ?? []),
  ].sort((a, b) => {
    const positionA = a.positionInViewFilterGroup ?? 0;
    const positionB = b.positionInViewFilterGroup ?? 0;
    return positionA - positionB;
  });

  const newPositionInViewFilterGroup =
    (childViewFiltersAndViewFilterGroups[
      childViewFiltersAndViewFilterGroups.length - 1
    ]?.positionInViewFilterGroup ?? 0) + 1;

  const handleAddFilter = () => {
    upsertCombinedViewFilter({
      id: v4(),
      variant: 'default',
      fieldMetadataId: undefined as any,
      operand: ViewFilterOperand.Is,
      value: '',
      displayValue: '',
      definition: {} as any,
      viewFilterGroupId: componentViewFilterGroup.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    });
  };

  return (
    <StyledContainer isGrayBackground={!!props.parentViewFilterGroupId}>
      {childViewFiltersAndViewFilterGroups?.map((child, i) =>
        child.__typename === 'ViewFilterGroup' ? (
          <StyledRow key={child.id}>
            <AdvancedFilterLogicalOperatorCell
              index={i}
              viewFilterGroup={child}
            />
            <AdvancedFilterViewFilterGroup
              viewBarInstanceId={props.viewBarInstanceId}
              parentViewFilterGroupId={componentViewFilterGroup.id}
            />
            <AdvancedFilterRuleOptionsDropdown
              dropdownId={`advanced-filter-rule-options-${child.id}`}
              viewFilterGroupId={child.id}
            />
          </StyledRow>
        ) : (
          <StyledRow key={child.id}>
            <AdvancedFilterLogicalOperatorCell
              index={i}
              viewFilterGroup={componentViewFilterGroup}
            />
            <AdvancedFilterViewFilter viewFilter={child} />
            <AdvancedFilterRuleOptionsDropdown
              dropdownId={`advanced-filter-rule-options-${child.id}`}
              viewFilterId={child.id}
            />
          </StyledRow>
        ),
      )}
      <LightButton
        Icon={IconPlus}
        title="Add filter rule"
        onClick={handleAddFilter}
      />
      {/* The following is a placeholder until design decision */}
      <LightButton
        Icon={IconPlus}
        title="Add filter rule group"
        onClick={() => {
          if (!currentViewWithCombinedFiltersAndSorts?.id) {
            throw new Error('Missing view id');
          }

          upsertCombinedViewFilterGroup({
            id: v4(),
            viewId: currentViewWithCombinedFiltersAndSorts?.id,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
            parentViewFilterGroupId: componentViewFilterGroup.id,
            positionInViewFilterGroup: newPositionInViewFilterGroup,
          });
        }}
      />
    </StyledContainer>
  );
};

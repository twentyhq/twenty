import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRuleOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRuleOptionsDropdown';
import { AdvancedFilterViewFilter } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilter';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import styled from '@emotion/styled';

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div<{ isGrayBackground?: boolean }>`
  align-items: start;
  background-color: ${({ theme, isGrayBackground }) =>
    isGrayBackground ? theme.background.transparent.lighter : 'transparent'};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

interface AdvancedFilterViewFilterGroupProps {
  parentViewFilterGroupId?: string;
  viewBarInstanceId: string;
}

export const AdvancedFilterViewFilterGroup = (
  props: AdvancedFilterViewFilterGroupProps,
) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const viewFilters = currentViewWithCombinedFiltersAndSorts?.viewFilters;
  const viewFilterGroups =
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups;

  const currentViewFilterGroup = viewFilterGroups?.find((viewFilterGroup) =>
    props.parentViewFilterGroupId
      ? viewFilterGroup.parentViewFilterGroupId ===
        props.parentViewFilterGroupId
      : !viewFilterGroup.parentViewFilterGroupId,
  );

  if (!currentViewFilterGroup) {
    throw new Error(
      `Missing component view filter group for view filter group with parent id of '${props.parentViewFilterGroupId}'`,
    );
  }

  const childViewFilters = viewFilters?.filter(
    (viewFilter) => viewFilter.viewFilterGroupId === currentViewFilterGroup.id,
  );

  const childViewFilterGroups = viewFilterGroups?.filter(
    (viewFilterGroup) =>
      viewFilterGroup.parentViewFilterGroupId === currentViewFilterGroup.id,
  );

  const childViewFiltersAndViewFilterGroups = [
    ...(childViewFilterGroups ?? []),
    ...(childViewFilters ?? []),
  ].sort((a, b) => {
    const positionA = a.positionInViewFilterGroup ?? 0;
    const positionB = b.positionInViewFilterGroup ?? 0;
    return positionA - positionB;
  });

  return (
    <StyledContainer isGrayBackground={!!props.parentViewFilterGroupId}>
      {childViewFiltersAndViewFilterGroups?.map((child, i) =>
        child.__typename === 'ViewFilterGroup' ? (
          <StyledRow key={child.id}>
            <AdvancedFilterLogicalOperatorCell
              index={i}
              viewFilterGroup={currentViewFilterGroup}
            />
            <AdvancedFilterViewFilterGroup
              viewBarInstanceId={props.viewBarInstanceId}
              parentViewFilterGroupId={currentViewFilterGroup.id}
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
              viewFilterGroup={currentViewFilterGroup}
            />
            <AdvancedFilterViewFilter viewFilter={child} />
            <AdvancedFilterRuleOptionsDropdown
              dropdownId={`advanced-filter-rule-options-${child.id}`}
              viewFilterId={child.id}
              parentViewFilterGroupId={currentViewFilterGroup.id}
              isOnlyViewFilterInGroup={
                childViewFiltersAndViewFilterGroups.length === 1
              }
            />
          </StyledRow>
        ),
      )}
      <AdvancedFilterAddFilterRuleSelect
        viewId={currentViewWithCombinedFiltersAndSorts?.id}
        currentViewFilterGroup={currentViewFilterGroup}
        childViewFiltersAndViewFilterGroups={
          childViewFiltersAndViewFilterGroups
        }
        isFilterRuleGroupOptionVisible={!props.parentViewFilterGroupId}
      />
    </StyledContainer>
  );
};

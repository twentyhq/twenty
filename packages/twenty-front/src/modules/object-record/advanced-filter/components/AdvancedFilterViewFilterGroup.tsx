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
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
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

  console.log(
    'componentViewFilterGroup',
    viewFilterGroups?.map((vfg) => vfg.parentViewFilterGroupId),
    props.parentViewFilterGroupId,
  );

  if (!componentViewFilterGroup) {
    throw new Error(
      `Missing component view filter group for view filter group with parent id of '${props.parentViewFilterGroupId}'`,
    );
  }

  const viewFilterGroupViewFilters = viewFilters?.filter(
    (viewFilter) =>
      viewFilter.viewFilterGroupId === componentViewFilterGroup.id,
  );

  const subViewFilterGroups = viewFilterGroups?.filter(
    (viewFilterGroup) =>
      viewFilterGroup.parentViewFilterGroupId === componentViewFilterGroup.id,
  );

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
    });
  };

  return (
    <StyledContainer>
      {subViewFilterGroups?.map((viewFilterGroup, i) => (
        <StyledRow>
          <AdvancedFilterLogicalOperatorCell
            index={i}
            viewFilterGroup={viewFilterGroup}
          />
          <AdvancedFilterViewFilterGroup
            viewBarInstanceId={props.viewBarInstanceId}
            parentViewFilterGroupId={componentViewFilterGroup.id}
          />
          <AdvancedFilterRuleOptionsDropdown
            dropdownId={`advanced-filter-rule-options-${viewFilterGroup.id}`}
            viewFilterGroupId={viewFilterGroup.id}
          />
        </StyledRow>
      ))}
      {viewFilterGroupViewFilters?.map((viewFilter, i) => (
        <StyledRow>
          <AdvancedFilterLogicalOperatorCell
            index={i}
            viewFilterGroup={componentViewFilterGroup}
          />
          <AdvancedFilterViewFilter viewFilter={viewFilter} />
          <AdvancedFilterRuleOptionsDropdown
            dropdownId={`advanced-filter-rule-options-${viewFilter.id}`}
            viewFilterId={viewFilter.id}
          />
        </StyledRow>
      ))}
      <LightButton
        Icon={IconPlus}
        title="Add filter rule"
        onClick={handleAddFilter}
      />
      {/* Placeholder until design decision */}
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
          });
        }}
      />
    </StyledContainer>
  );
};

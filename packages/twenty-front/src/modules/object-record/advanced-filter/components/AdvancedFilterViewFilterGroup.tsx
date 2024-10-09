import { AdvancedFilterRow } from '@/object-record/advanced-filter/components/AdvancedFilterRow';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';
import { v4 } from 'uuid';

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

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const viewFilters = currentViewWithCombinedFiltersAndSorts?.viewFilters;
  const viewFilterGroups =
    currentViewWithCombinedFiltersAndSorts?.viewFilterGroups;

  const viewFilterGroup = viewFilterGroups?.find((viewFilterGroup) =>
    props.parentViewFilterGroupId
      ? viewFilterGroup.parentViewFilterGroupId ===
        props.parentViewFilterGroupId
      : !viewFilterGroup.parentViewFilterGroupId,
  );

  if (!viewFilterGroup) {
    throw new Error('Missing view filter group');
  }

  const viewFilterGroupViewFilters = viewFilters?.filter(
    (viewFilter) => viewFilter.viewFilterGroupId === viewFilterGroup.id,
  );

  const subViewFilterGroups = viewFilterGroups?.filter(
    (viewFilterGroup) =>
      viewFilterGroup.parentViewFilterGroupId === viewFilterGroup.id,
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
      viewFilterGroupId: viewFilterGroup.id,
    });
  };

  return (
    <StyledContainer>
      {subViewFilterGroups?.map((viewFilterGroup, i) => (
        <AdvancedFilterRow
          key={viewFilterGroup.id}
          viewBarInstanceId={props.viewBarInstanceId}
          index={i}
          logicalOperator={viewFilterGroup.logicalOperator}
          viewFilterGroupId={viewFilterGroup.id}
        />
      ))}
      {viewFilterGroupViewFilters?.map((viewFilter, i) => (
        <AdvancedFilterRow
          key={viewFilter.id}
          viewBarInstanceId={props.viewBarInstanceId}
          index={i}
          logicalOperator={viewFilterGroup.logicalOperator}
          viewFilter={viewFilter}
        />
      ))}
      <LightButton
        Icon={IconPlus}
        title="Add filter rule"
        onClick={handleAddFilter}
      />
    </StyledContainer>
  );
};

import { AdvancedFilterRow } from '@/object-record/advanced-filter/components/AdvancedFilterRow';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

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
    return 'Missing view filter group';
  }

  const viewFilterGroupViewFilters = viewFilters?.filter(
    (viewFilter) => viewFilter.viewFilterGroupId === viewFilterGroup.id,
  );

  const viewFilterGroupViewFilterGroups = viewFilterGroups?.filter(
    (viewFilterGroup) =>
      viewFilterGroup.parentViewFilterGroupId === viewFilterGroup.id,
  );

  return (
    <StyledContainer>
      {viewFilterGroupViewFilterGroups?.map((viewFilterGroup, i) => (
        <AdvancedFilterRow
          key={viewFilterGroup.id}
          index={i}
          logicalOperator={viewFilterGroup.logicalOperator}
          viewFilterGroupId={viewFilterGroup.id}
        />
      ))}
      {viewFilterGroupViewFilters?.map((viewFilter, i) => (
        <AdvancedFilterRow
          key={viewFilter.id}
          index={i}
          logicalOperator={viewFilterGroup.logicalOperator}
          viewFilter={viewFilter}
        />
      ))}
      <LightButton Icon={IconPlus} title="Add filter rule" />
    </StyledContainer>
  );
};

import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRuleOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRuleOptionsDropdown';
import { AdvancedFilterViewFilter } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilter';
import { useCurrentViewViewFilterGroup } from '@/object-record/advanced-filter/hooks/useCurrentViewViewFilterGroup';
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

type AdvancedFilterViewFilterGroupProps = {
  viewFilterGroupId: string;
};

export const AdvancedFilterViewFilterGroup = ({
  viewFilterGroupId,
}: AdvancedFilterViewFilterGroupProps) => {
  const {
    currentViewFilterGroup,
    childViewFiltersAndViewFilterGroups,
    lastChildPosition,
  } = useCurrentViewViewFilterGroup({
    viewFilterGroupId,
  });

  if (!currentViewFilterGroup) {
    return null;
  }

  return (
    <StyledContainer
      isGrayBackground={!!currentViewFilterGroup.parentViewFilterGroupId}
    >
      {childViewFiltersAndViewFilterGroups.map((child, i) => (
        <StyledRow key={child.id}>
          <AdvancedFilterLogicalOperatorCell
            index={i}
            viewFilterGroup={currentViewFilterGroup}
          />
          <AdvancedFilterViewFilter viewFilterId={child.id} />
          <AdvancedFilterRuleOptionsDropdown viewFilterId={child.id} />
        </StyledRow>
      ))}
      <AdvancedFilterAddFilterRuleSelect
        viewFilterGroup={currentViewFilterGroup}
        lastChildPosition={lastChildPosition}
      />
    </StyledContainer>
  );
};

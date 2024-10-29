import { AdvancedFilterAddFilterDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterDropdown';
import { AdvancedFilterFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterFilterGroup';
import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { AdvancedFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterOptionsDropdown';
import { AdvancedFilterSingleFilter } from '@/object-record/advanced-filter/components/AdvancedFilterSingleFilter';
import { useCurrentViewViewFilterGroup } from '@/object-record/advanced-filter/hooks/useCurrentViewViewFilterGroup';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-ui';

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

type AdvancedFilterRootLevelViewFilterGroupProps = {
  rootLevelViewFilterGroupId: string;
};

export const AdvancedFilterDropdownContent = ({
  rootLevelViewFilterGroupId,
}: AdvancedFilterRootLevelViewFilterGroupProps) => {
  const {
    currentViewFilterGroup: rootLevelViewFilterGroup,
    childViewFiltersAndViewFilterGroups,
    lastChildPosition,
  } = useCurrentViewViewFilterGroup({
    viewFilterGroupId: rootLevelViewFilterGroupId,
  });

  if (!isDefined(rootLevelViewFilterGroup)) {
    return null;
  }

  return (
    <StyledContainer>
      {childViewFiltersAndViewFilterGroups.map((child, i) =>
        child.__typename === 'ViewFilterGroup' ? (
          <StyledRow key={child.id}>
            <AdvancedFilterLogicalOperatorDropdown
              index={i}
              viewFilterGroup={rootLevelViewFilterGroup}
            />
            <AdvancedFilterFilterGroup viewFilterGroupId={child.id} />
            <AdvancedFilterOptionsDropdown viewFilterGroupId={child.id} />
          </StyledRow>
        ) : (
          <StyledRow key={child.id}>
            <AdvancedFilterLogicalOperatorDropdown
              index={i}
              viewFilterGroup={rootLevelViewFilterGroup}
            />
            <AdvancedFilterSingleFilter viewFilterId={child.id} />
            <AdvancedFilterOptionsDropdown viewFilterId={child.id} />
          </StyledRow>
        ),
      )}
      <AdvancedFilterAddFilterDropdown
        viewFilterGroup={rootLevelViewFilterGroup}
        lastChildPosition={lastChildPosition}
      />
    </StyledContainer>
  );
};

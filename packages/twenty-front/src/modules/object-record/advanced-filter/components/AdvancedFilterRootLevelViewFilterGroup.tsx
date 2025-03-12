import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRecordFilterGroupChildOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupChildOptionsDropdown';

import { AdvancedFilterRecordFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroup';
import { AdvancedFilterViewFilter } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilter';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';

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
  rootLevelRecordFilterGroupId: string;
};

export const AdvancedFilterRootLevelViewFilterGroup = ({
  rootLevelRecordFilterGroupId,
}: AdvancedFilterRootLevelViewFilterGroupProps) => {
  const {
    currentRecordFilterGroup: rootLevelRecordFilterGroup,
    childRecordFiltersAndRecordFilterGroups,
    lastChildPosition,
  } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId: rootLevelRecordFilterGroupId,
  });

  if (!isDefined(rootLevelRecordFilterGroup)) {
    return null;
  }

  return (
    <StyledContainer>
      {childRecordFiltersAndRecordFilterGroups.map((child, i) =>
        isRecordFilterGroupChildARecordFilterGroup(child) ? (
          <StyledRow key={child.id}>
            <AdvancedFilterLogicalOperatorCell
              index={i}
              recordFilterGroup={rootLevelRecordFilterGroup}
            />
            <AdvancedFilterRecordFilterGroup recordFilterGroupId={child.id} />
            <AdvancedFilterRecordFilterGroupChildOptionsDropdown
              recordFilterGroupChild={child}
            />
          </StyledRow>
        ) : (
          <StyledRow key={child.id}>
            <AdvancedFilterLogicalOperatorCell
              index={i}
              recordFilterGroup={rootLevelRecordFilterGroup}
            />
            <AdvancedFilterViewFilter viewFilterId={child.id} />
            <AdvancedFilterRecordFilterGroupChildOptionsDropdown
              recordFilterGroupChild={child}
            />
          </StyledRow>
        ),
      )}
      <AdvancedFilterAddFilterRuleSelect
        recordFilterGroup={rootLevelRecordFilterGroup}
        lastChildPosition={lastChildPosition}
      />
    </StyledContainer>
  );
};

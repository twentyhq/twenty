import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRecordFilterGroupChildOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupChildOptionsDropdown';

import { AdvancedFilterRecordFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroup';
import { AdvancedFilterViewFilter } from '@/object-record/advanced-filter/components/AdvancedFilterViewFilter';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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

export const AdvancedFilterRootLevelViewFilterGroup = () => {
  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const rootRecordFilterGroupId = currentRecordFilterGroups.find(
    (recordFilterGroup) => !recordFilterGroup.parentRecordFilterGroupId,
  )?.id;

  const {
    currentRecordFilterGroup: rootLevelRecordFilterGroup,
    childRecordFiltersAndRecordFilterGroups,
  } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId: rootRecordFilterGroupId,
  });

  if (!isDefined(rootLevelRecordFilterGroup)) {
    return null;
  }

  return (
    <StyledContainer>
      {childRecordFiltersAndRecordFilterGroups.map(
        (recordFilterGroupChild, recordFilterGroupChildIndex) =>
          isRecordFilterGroupChildARecordFilterGroup(recordFilterGroupChild) ? (
            <StyledRow key={recordFilterGroupChild.id}>
              <AdvancedFilterLogicalOperatorCell
                index={recordFilterGroupChildIndex}
                recordFilterGroup={rootLevelRecordFilterGroup}
              />
              <AdvancedFilterRecordFilterGroup
                recordFilterGroupId={recordFilterGroupChild.id}
              />
              <AdvancedFilterRecordFilterGroupChildOptionsDropdown
                recordFilterGroupChild={recordFilterGroupChild}
              />
            </StyledRow>
          ) : (
            <StyledRow key={recordFilterGroupChild.id}>
              <AdvancedFilterLogicalOperatorCell
                index={recordFilterGroupChildIndex}
                recordFilterGroup={rootLevelRecordFilterGroup}
              />
              <AdvancedFilterViewFilter
                viewFilterId={recordFilterGroupChild.id}
              />
              <AdvancedFilterRecordFilterGroupChildOptionsDropdown
                recordFilterGroupChild={recordFilterGroupChild}
              />
            </StyledRow>
          ),
      )}
      <AdvancedFilterAddFilterRuleSelect
        recordFilterGroup={rootLevelRecordFilterGroup}
      />
    </StyledContainer>
  );
};

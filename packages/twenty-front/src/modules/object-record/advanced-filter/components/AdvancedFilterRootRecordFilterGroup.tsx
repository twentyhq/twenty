import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';

import { AdvancedFilterRecordFilterGroupRow } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupRow';
import { AdvancedFilterRecordFilterRow } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterRow';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { isRecordFilterGroupChildARecordFilterGroup } from '@/object-record/advanced-filter/utils/isRecordFilterGroupChildARecordFilterGroup';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';

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

export const AdvancedFilterRootRecordFilterGroup = () => {
  const rootRecordFilterGroup = useRecoilComponentValueV2(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: rootRecordFilterGroup?.id,
    });

  if (!isDefined(rootRecordFilterGroup)) {
    return null;
  }

  return (
    <StyledContainer>
      {childRecordFiltersAndRecordFilterGroups.map(
        (recordFilterGroupChild, recordFilterGroupChildIndex) =>
          isRecordFilterGroupChildARecordFilterGroup(recordFilterGroupChild) ? (
            <AdvancedFilterRecordFilterGroupRow
              key={recordFilterGroupChild.id}
              parentRecordFilterGroup={rootRecordFilterGroup}
              recordFilterGroup={recordFilterGroupChild}
              recordFilterGroupIndex={recordFilterGroupChildIndex}
            />
          ) : (
            <AdvancedFilterRecordFilterRow
              key={recordFilterGroupChild.id}
              recordFilterGroup={rootRecordFilterGroup}
              recordFilter={recordFilterGroupChild}
              recordFilterIndex={recordFilterGroupChildIndex}
            />
          ),
      )}
      <AdvancedFilterAddFilterRuleSelect
        recordFilterGroup={rootRecordFilterGroup}
      />
    </StyledContainer>
  );
};

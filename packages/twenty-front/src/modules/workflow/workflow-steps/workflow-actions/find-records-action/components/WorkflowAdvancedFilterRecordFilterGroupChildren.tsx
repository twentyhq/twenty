import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';

import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { WorkflowAdvancedFilterRecordFilterColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterRecordFilterColumn';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div<{ isGrayBackground?: boolean }>`
  align-items: start;
  background-color: ${({ theme, isGrayBackground }) =>
    isGrayBackground ? theme.background.transparent.lighter : 'transparent'};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

type WorkflowAdvancedFilterRecordFilterGroupChildrenProps = {
  recordFilterGroupId: string;
};

export const WorkflowAdvancedFilterRecordFilterGroupChildren = ({
  recordFilterGroupId,
}: WorkflowAdvancedFilterRecordFilterGroupChildrenProps) => {
  const { readonly } = useContext(AdvancedFilterContext);
  const { currentRecordFilterGroup, childRecordFilters } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId,
    });

  if (!currentRecordFilterGroup) {
    return null;
  }

  const hasParentRecordFilterGroup = isDefined(
    currentRecordFilterGroup.parentRecordFilterGroupId,
  );

  return (
    <StyledContainer isGrayBackground={hasParentRecordFilterGroup}>
      {childRecordFilters.map((childRecordFilter, childRecordFilterIndex) => (
        <WorkflowAdvancedFilterRecordFilterColumn
          key={childRecordFilter.id}
          recordFilter={childRecordFilter}
          recordFilterIndex={childRecordFilterIndex}
          recordFilterGroup={currentRecordFilterGroup}
        />
      ))}
      {!readonly && (
        <AdvancedFilterAddFilterRuleSelect
          recordFilterGroup={currentRecordFilterGroup}
        />
      )}
    </StyledContainer>
  );
};

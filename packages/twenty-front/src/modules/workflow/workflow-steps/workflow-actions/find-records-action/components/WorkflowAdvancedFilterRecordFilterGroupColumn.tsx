import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { WorkflowAdvancedFilterDropdownColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterDropdownColumn';
import { WorkflowAdvancedFilterLogicalOperatorCell } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterLogicalOperatorCell';
import { WorkflowAdvancedFilterRecordFilterGroupChildren } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterRecordFilterGroupChildren';
import styled from '@emotion/styled';
import { useContext } from 'react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowAdvancedFilterRecordFilterGroupColumn = ({
  parentRecordFilterGroup,
  recordFilterGroup,
  recordFilterGroupIndex,
}: {
  parentRecordFilterGroup: RecordFilterGroup;
  recordFilterGroup: RecordFilterGroup;
  recordFilterGroupIndex: number;
}) => {
  const { readonly } = useContext(AdvancedFilterContext);

  return (
    <WorkflowAdvancedFilterDropdownColumn>
      <StyledContainer>
        <WorkflowAdvancedFilterLogicalOperatorCell
          index={recordFilterGroupIndex}
          recordFilterGroup={parentRecordFilterGroup}
        />
        {!readonly && (
          <AdvancedFilterRecordFilterGroupOptionsDropdown
            recordFilterGroupId={recordFilterGroup.id}
          />
        )}
      </StyledContainer>
      <WorkflowAdvancedFilterRecordFilterGroupChildren
        recordFilterGroupId={recordFilterGroup.id}
      />
    </WorkflowAdvancedFilterDropdownColumn>
  );
};

import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { WorkflowAdvancedFilterDropdownColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterDropdownColumn';
import { WorkflowAdvancedFilterLogicalOperatorCell } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterLogicalOperatorCell';
import { WorkflowAdvancedFilterRecordFilterGroupChildren } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterRecordFilterGroupChildren';
import styled from '@emotion/styled';

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
  return (
    <WorkflowAdvancedFilterDropdownColumn>
      <StyledContainer>
        <WorkflowAdvancedFilterLogicalOperatorCell
          index={recordFilterGroupIndex}
          recordFilterGroup={parentRecordFilterGroup}
        />
        <AdvancedFilterRecordFilterGroupOptionsDropdown
          recordFilterGroupId={recordFilterGroup.id}
        />
      </StyledContainer>
      <WorkflowAdvancedFilterRecordFilterGroupChildren
        recordFilterGroupId={recordFilterGroup.id}
      />
    </WorkflowAdvancedFilterDropdownColumn>
  );
};

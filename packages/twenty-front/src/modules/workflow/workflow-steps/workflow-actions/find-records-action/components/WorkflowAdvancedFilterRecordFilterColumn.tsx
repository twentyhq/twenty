import { AdvancedFilterFieldSelectDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownButton';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { WorkflowAdvancedFilterDropdownColumn } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterDropdownColumn';
import { WorkflowAdvancedFilterValueFormInput } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterFormInput';
import { WorkflowAdvancedFilterLogicalOperatorCell } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterLogicalOperatorCell';
import { WorkflowAdvancedFilterRecordFilterOperandSelect } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterRecordFilterOperandSelect';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowAdvancedFilterRecordFilterColumn = ({
  recordFilterGroup,
  recordFilter,
  recordFilterIndex,
}: {
  recordFilterGroup: RecordFilterGroup;
  recordFilter: RecordFilter;
  recordFilterIndex: number;
}) => {
  return (
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{
        instanceId: getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        ),
      }}
    >
      <WorkflowAdvancedFilterDropdownColumn>
        <StyledContainer>
          <WorkflowAdvancedFilterLogicalOperatorCell
            index={recordFilterIndex}
            recordFilterGroup={recordFilterGroup}
          />
          <AdvancedFilterRecordFilterOptionsDropdown
            recordFilterId={recordFilter.id}
          />
        </StyledContainer>
        <AdvancedFilterFieldSelectDropdownButton
          recordFilterId={recordFilter.id}
        />
        <WorkflowAdvancedFilterRecordFilterOperandSelect
          recordFilterId={recordFilter.id}
        />
        <WorkflowAdvancedFilterValueFormInput
          recordFilterId={recordFilter.id}
        />
      </WorkflowAdvancedFilterDropdownColumn>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};

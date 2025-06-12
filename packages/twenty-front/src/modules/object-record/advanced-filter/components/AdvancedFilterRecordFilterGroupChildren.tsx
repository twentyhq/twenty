import { AdvancedFilterAddFilterRuleSelect } from '@/object-record/advanced-filter/components/AdvancedFilterAddFilterRuleSelect';
import { AdvancedFilterRecordFilter } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilter';

import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import styled from '@emotion/styled';
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
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

type AdvancedFilterRecordFilterGroupChildrenProps = {
  recordFilterGroupId: string;
  VariablePicker?: VariablePickerComponent;
};

export const AdvancedFilterRecordFilterGroupChildren = ({
  recordFilterGroupId,
  VariablePicker,
}: AdvancedFilterRecordFilterGroupChildrenProps) => {
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
        <AdvancedFilterRecordFilter
          key={childRecordFilter.id}
          recordFilter={childRecordFilter}
          recordFilterIndex={childRecordFilterIndex}
          recordFilterGroup={currentRecordFilterGroup}
          VariablePicker={VariablePicker}
        />
      ))}
      <AdvancedFilterAddFilterRuleSelect
        recordFilterGroup={currentRecordFilterGroup}
      />
    </StyledContainer>
  );
};

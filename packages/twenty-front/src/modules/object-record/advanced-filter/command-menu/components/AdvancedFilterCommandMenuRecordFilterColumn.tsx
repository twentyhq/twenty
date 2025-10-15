import { AdvancedFilterCommandMenuColumn } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuColumn';
import { AdvancedFilterCommandMenuFieldSelectDisabled } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuFieldSelectDisabled';
import { AdvancedFilterCommandMenuLogicalOperatorCell } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuLogicalOperatorCell';

import { AdvancedFilterCommandMenuRecordFilterOperandSelect } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuRecordFilterOperandSelect';
import { AdvancedFilterCommandMenuValueFormInput } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuValueFormInput';
import { AdvancedFilterFieldSelectDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownButton';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import styled from '@emotion/styled';
import { useContext } from 'react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type AdvancedFilterCommandMenuRecordFilterColumnProps = {
  recordFilterGroup: RecordFilterGroup;
  recordFilter: RecordFilter;
  recordFilterIndex: number;
};

export const AdvancedFilterCommandMenuRecordFilterColumn = ({
  recordFilterGroup,
  recordFilter,
  recordFilterIndex,
}: AdvancedFilterCommandMenuRecordFilterColumnProps) => {
  const { readonly } = useContext(AdvancedFilterContext);

  return (
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{
        instanceId: getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        ),
      }}
    >
      <AdvancedFilterCommandMenuColumn>
        <StyledContainer>
          <AdvancedFilterCommandMenuLogicalOperatorCell
            index={recordFilterIndex}
            recordFilterGroup={recordFilterGroup}
          />
          {!readonly && (
            <AdvancedFilterRecordFilterOptionsDropdown
              recordFilterId={recordFilter.id}
            />
          )}
        </StyledContainer>
        {readonly ? (
          <AdvancedFilterCommandMenuFieldSelectDisabled
            recordFilterId={recordFilter.id}
          />
        ) : (
          <AdvancedFilterFieldSelectDropdownButton
            recordFilterId={recordFilter.id}
          />
        )}
        <AdvancedFilterCommandMenuRecordFilterOperandSelect
          recordFilterId={recordFilter.id}
        />
        <AdvancedFilterCommandMenuValueFormInput
          recordFilterId={recordFilter.id}
        />
      </AdvancedFilterCommandMenuColumn>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};

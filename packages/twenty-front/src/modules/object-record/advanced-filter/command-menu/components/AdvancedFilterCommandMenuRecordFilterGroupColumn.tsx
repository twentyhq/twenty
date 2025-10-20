import { AdvancedFilterCommandMenuColumn } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuColumn';
import { AdvancedFilterCommandMenuLogicalOperatorCell } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuLogicalOperatorCell';
import { AdvancedFilterCommandMenuRecordFilterGroupChildren } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuRecordFilterGroupChildren';
import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

import styled from '@emotion/styled';
import { useContext } from 'react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const AdvancedFilterCommandMenuRecordFilterGroupColumn = ({
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
    <AdvancedFilterCommandMenuColumn>
      <StyledContainer>
        <AdvancedFilterCommandMenuLogicalOperatorCell
          index={recordFilterGroupIndex}
          recordFilterGroup={parentRecordFilterGroup}
        />
        {!readonly && (
          <AdvancedFilterRecordFilterGroupOptionsDropdown
            recordFilterGroupId={recordFilterGroup.id}
          />
        )}
      </StyledContainer>
      <AdvancedFilterCommandMenuRecordFilterGroupChildren
        recordFilterGroupId={recordFilterGroup.id}
      />
    </AdvancedFilterCommandMenuColumn>
  );
};

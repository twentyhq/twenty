import { useContext } from 'react';
import styled from '@emotion/styled';

import { CheckboxCell } from '@/object-record/record-table/components/CheckboxCell';
import { StyledRecordTableTd } from '@/object-record/record-table/components/StyledRecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

const StyledCheckboxTd = styled(StyledRecordTableTd)`
  border-right: transparent;
`;

export const RecordTableCellCheckbox = () => {
  const { isSelected, isDragging } = useContext(RecordTableRowContext);

  return (
    <StyledCheckboxTd isSelected={isSelected}>
      {!isDragging && <CheckboxCell />}
    </StyledCheckboxTd>
  );
};

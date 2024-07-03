import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { StyledRecordTableTd } from '@/object-record/record-table/components/StyledRecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const RecordTableCellsEmpty = () => {
  const { isSelected } = useContext(RecordTableRowContext);
  const { visibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  return visibleTableColumns.map((column) => (
    <StyledRecordTableTd
      isSelected={isSelected}
      key={column.fieldMetadataId}
    ></StyledRecordTableTd>
  ));
};

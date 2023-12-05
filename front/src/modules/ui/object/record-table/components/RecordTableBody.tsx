import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import {
  RecordTableRow,
  StyledRow,
} from '@/ui/object/record-table/components/RecordTableRow';
import { RowIdContext } from '@/ui/object/record-table/contexts/RowIdContext';
import { RowIndexContext } from '@/ui/object/record-table/contexts/RowIndexContext';
import { useRecordTableScopedStates } from '@/ui/object/record-table/hooks/internal/useRecordTableScopedStates';
import { isFetchingRecordTableDataState } from '@/ui/object/record-table/states/isFetchingRecordTableDataState';

import { useRecordTable } from '../hooks/useRecordTable';
import { tableRowIdsState } from '../states/tableRowIdsState';

export const RecordTableBody = () => {
  const { ref: lastTableRowRef, inView: lastTableRowIsVisible } = useInView();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const { scopeId: objectNamePlural } = useRecordTable();
  const { tableLastRowVisibleState } = useRecordTableScopedStates();
  const setTableLastRowVisible = useSetRecoilState(tableLastRowVisibleState);

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );

  const [isFetchingMoreObjects] = useRecoilState(
    isFetchingMoreRecordsFamilyState(foundObjectMetadataItem?.namePlural),
  );

  const isFetchingRecordTableData = useRecoilValue(
    isFetchingRecordTableDataState,
  );
  const lastRowId = tableRowIds[tableRowIds.length - 1];

  useEffect(() => {
    setTableLastRowVisible(lastTableRowIsVisible);
  }, [lastTableRowIsVisible, setTableLastRowVisible]);

  if (isFetchingRecordTableData) {
    return <></>;
  }

  return (
    <tbody>
      {tableRowIds.map((rowId, rowIndex) => (
        <RowIdContext.Provider value={rowId} key={rowId}>
          <RowIndexContext.Provider value={rowIndex}>
            <RecordTableRow
              key={rowId}
              ref={rowId === lastRowId ? lastTableRowRef : undefined}
              rowId={rowId}
            />
          </RowIndexContext.Provider>
        </RowIdContext.Provider>
      ))}
      {isFetchingMoreObjects && (
        <StyledRow selected={false}>
          <td style={{ height: 50 }} colSpan={1000}>
            Loading more...
          </td>
        </StyledRow>
      )}
    </tbody>
  );
};

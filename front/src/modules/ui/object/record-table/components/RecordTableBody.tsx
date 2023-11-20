import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { isFetchingMoreObjectsFamilyState } from '@/object-record/states/isFetchingMoreObjectsFamilyState';
import { isDefined } from '~/utils/isDefined';

import { RowIdContext } from '../contexts/RowIdContext';
import { RowIndexContext } from '../contexts/RowIndexContext';
import { useRecordTable } from '../hooks/useRecordTable';
import { isFetchingRecordTableDataState } from '../states/isFetchingRecordTableDataState';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { RecordTableRow, StyledRow } from './RecordTableRow';

export const RecordTableBody = () => {
  const { ref: lastTableRowRef, inView: lastTableRowIsVisible } = useInView();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const { scopeId: objectNamePlural } = useRecordTable();

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem({
    objectNamePlural,
  });

  const [isFetchingMoreObjects] = useRecoilState(
    isFetchingMoreObjectsFamilyState(foundObjectMetadataItem?.namePlural),
  );

  const isFetchingRecordTableData = useRecoilValue(
    isFetchingRecordTableDataState,
  );

  const { fetchMoreObjects } = useObjectRecordTable();

  useEffect(() => {
    if (lastTableRowIsVisible && isDefined(fetchMoreObjects)) {
      fetchMoreObjects();
    }
  }, [lastTableRowIsVisible, fetchMoreObjects]);

  const lastRowId = tableRowIds[tableRowIds.length - 1];

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
            Fetching more...
          </td>
        </StyledRow>
      )}
    </tbody>
  );
};

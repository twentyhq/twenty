import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import {
  RecordTableRow,
  StyledRow,
} from '@/ui/object/record-table/components/RecordTableRow';
import { RowIdContext } from '@/ui/object/record-table/contexts/RowIdContext';
import { RowIndexContext } from '@/ui/object/record-table/contexts/RowIndexContext';
import { isFetchingRecordTableDataState } from '@/ui/object/record-table/states/isFetchingRecordTableDataState';
import { isDefined } from '~/utils/isDefined';

import { useRecordTable } from '../hooks/useRecordTable';
import { tableRowIdsState } from '../states/tableRowIdsState';

export const RecordTableBody = () => {
  const { ref: lastTableRowRef, inView: lastTableRowIsVisible } = useInView();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const { scopeId: objectNamePlural } = useRecordTable();

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

  // Todo, move this to an effect to not trigger many re-renders
  const { fetchMoreRecords: fetchMoreObjects } = useObjectRecordTable();

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
            Loading more...
          </td>
        </StyledRow>
      )}
    </tbody>
  );
};

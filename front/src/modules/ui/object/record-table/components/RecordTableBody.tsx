import React, { useContext, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useRecordTableScopedStates } from '@/ui/object/record-table/hooks/internal/useRecordTableScopedStates';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';
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

  const { fetchMoreRecords: fetchMoreObjects } = useObjectRecordTable();

  useEffect(() => {
    if (lastTableRowIsVisible && isDefined(fetchMoreObjects)) {
      fetchMoreObjects();
    }
  }, [lastTableRowIsVisible, fetchMoreObjects]);

  useEffect(() => {
    if (lastTableRowIsVisible && isDefined(fetchMoreObjects)) {
      fetchMoreObjects();
    }
  }, [lastTableRowIsVisible, fetchMoreObjects]);

  const lastRowId = tableRowIds[tableRowIds.length - 1];

  const scrollWrapperRef = useContext(ScrollWrapperContext);

  const rowVirtualizer = useVirtualizer({
    count: tableRowIds.length,
    getScrollElement: () => scrollWrapperRef.current,
    estimateSize: () => 40,
  });

  if (isFetchingRecordTableData) {
    return <></>;
  }

  return (
    <tbody
      style={{
        height: rowVirtualizer.getTotalSize(),
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualItem) => {
        const rowId = tableRowIds[virtualItem.index];
        return (
          <RowIdContext.Provider value={rowId} key={virtualItem.key}>
            <RowIndexContext.Provider value={virtualItem.index}>
              <RecordTableRow
                key={virtualItem.key}
                ref={rowId === lastRowId ? lastTableRowRef : undefined}
                rowId={rowId}
                style={{
                  height: virtualItem.size,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              />
            </RowIndexContext.Provider>
          </RowIdContext.Provider>
        );
      })}
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

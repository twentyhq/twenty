import { useCallback } from 'react';
import { useVirtual } from '@tanstack/react-virtual';
import { useRecoilValue } from 'recoil';

import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';

import { RowIdContext } from '../contexts/RowIdContext';
import { RowIndexContext } from '../contexts/RowIndexContext';
import { isFetchingEntityTableDataState } from '../states/isFetchingEntityTableDataState';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { EntityTableRow } from './EntityTableRow';

type EntityTableBodyProps = {
  tableBodyRef: React.RefObject<HTMLDivElement>;
};

export function EntityTableBody({ tableBodyRef }: EntityTableBodyProps) {
  const rowIds = useRecoilValue(tableRowIdsState);

  const isNavbarSwitchingSize = useRecoilValue(isNavbarSwitchingSizeState);
  const isFetchingEntityTableData = useRecoilValue(
    isFetchingEntityTableDataState,
  );

  // Adjust this to the height of a single row.
  const rowHeight = 33;

  const virtualRows = useVirtual({
    size: rowIds.length,
    parentRef: tableBodyRef,
    estimateSize: useCallback(() => rowHeight, []),
    overscan: 10, // Number of rows to render outside of the viewport. Adjust as needed.
  });

  if (isFetchingEntityTableData || isNavbarSwitchingSize) {
    return null;
  }

  return (
    <div
      style={{
        height: `${virtualRows.totalSize}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualRows.virtualItems.map((virtualRow) => {
        const rowId = rowIds[virtualRow.index];
        return (
          <RowIdContext.Provider value={rowId} key={rowId}>
            <RowIndexContext.Provider value={virtualRow.index}>
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <EntityTableRow rowId={rowId} />
              </div>
            </RowIndexContext.Provider>
          </RowIdContext.Provider>
        );
      })}
    </div>
  );
}

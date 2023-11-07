import styled from '@emotion/styled';
import { useVirtual } from '@tanstack/react-virtual';
import { useRecoilValue } from 'recoil';

import { Button } from '@/ui/input/button/components/Button';
import { useScrollWrapperScopedRef } from '@/ui/utilities/scroll/hooks/useScrollWrapperScopedRef';

import { RowIdContext } from '../contexts/RowIdContext';
import { RowIndexContext } from '../contexts/RowIndexContext';
import { isFetchingRecordTableDataState } from '../states/isFetchingRecordTableDataState';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { RecordTableRow } from './RecordTableRow';

type SpaceProps = {
  top?: number;
  bottom?: number;
};

const StyledSpace = styled.td<SpaceProps>`
  ${({ top }) => top && `padding-top: ${top}px;`}
  ${({ bottom }) => bottom && `padding-bottom: ${bottom}px;`}
`;

export const RecordTableBody = () => {
  const scrollWrapperRef = useScrollWrapperScopedRef();

  // const [fetchMoreObjects] = useRecoilState(fetchMoreObjectsFamilyState(''));

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const isFetchingRecordTableData = useRecoilValue(
    isFetchingRecordTableDataState,
  );

  const rowVirtualizer = useVirtual({
    size: tableRowIds.length,
    parentRef: scrollWrapperRef,
    overscan: 5,
  });

  const items = rowVirtualizer.virtualItems;
  const paddingTop = items.length > 0 ? items[0].start : 0;
  const paddingBottom =
    items.length > 0
      ? rowVirtualizer.totalSize - items[items.length - 1].end
      : 0;
  console.log({ rowVirtualizer, isFetchingRecordTableData });

  // useEffect(() => {
  //   const [lastItem] = [...rowVirtualizer.virtualItems].reverse();

  //   if (!lastItem) {
  //     return;
  //   }

  //   if (lastItem.index >= tableRowIds.length - 1) {
  //     console.log('fetching next page');
  //   }
  // }, [rowVirtualizer.virtualItems, tableRowIds]);

  // const { fetchMore } = useTableObjects();

  const handleFetchMoreClick = () => {
    // console.log({ fetchMoreObjects });
    // if (fetchMore) {
    //   fetchMore({});
    // }
  };

  if (isFetchingRecordTableData) {
    return null;
  }

  return (
    <tbody>
      {paddingTop > 0 && (
        <tr>
          <StyledSpace top={paddingTop} />
        </tr>
      )}
      {items.map((virtualItem) => {
        const rowId = tableRowIds[virtualItem.index];

        return (
          <RowIdContext.Provider value={rowId} key={rowId}>
            <RowIndexContext.Provider value={virtualItem.index}>
              <RecordTableRow
                key={virtualItem.index}
                ref={virtualItem.measureRef}
                rowId={rowId}
              />
            </RowIndexContext.Provider>
          </RowIdContext.Provider>
        );
      })}
      <tr>
        <Button onClick={handleFetchMoreClick} title="Fetch more" />
      </tr>
      {paddingBottom > 0 && (
        <tr>
          <StyledSpace bottom={paddingBottom} />
        </tr>
      )}
    </tbody>
  );
};

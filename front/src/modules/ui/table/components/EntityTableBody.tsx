import styled from '@emotion/styled';
import { useVirtual } from '@tanstack/react-virtual';
import { useRecoilValue } from 'recoil';

import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';
import { useScrollWrapperScopedRef } from '@/ui/utilities/scroll/hooks/useScrollWrapperScopedRef';

import { RowIdContext } from '../contexts/RowIdContext';
import { RowIndexContext } from '../contexts/RowIndexContext';
import { isFetchingEntityTableDataState } from '../states/isFetchingEntityTableDataState';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { EntityTableRow } from './EntityTableRow';

type SpaceProps = {
  top?: number;
  bottom?: number;
};

const StyledSpace = styled.td<SpaceProps>`
  ${({ top }) => top && `padding-top: ${top}px;`}
  ${({ bottom }) => bottom && `padding-bottom: ${bottom}px;`}
`;

export const EntityTableBody = () => {
  const scrollWrapperRef = useScrollWrapperScopedRef();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const isNavbarSwitchingSize = useRecoilValue(isNavbarSwitchingSizeState);
  const isFetchingEntityTableData = useRecoilValue(
    isFetchingEntityTableDataState,
  );

  const rowVirtualizer = useVirtual({
    size: tableRowIds.length,
    parentRef: scrollWrapperRef,
    overscan: 50,
  });

  const items = rowVirtualizer.virtualItems;
  const paddingTop = items.length > 0 ? items[0].start : 0;
  const paddingBottom =
    items.length > 0
      ? rowVirtualizer.totalSize - items[items.length - 1].end
      : 0;

  if (isFetchingEntityTableData || isNavbarSwitchingSize) {
    return null;
  }

  return (
    <tbody data-testid="t-body">
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
              <EntityTableRow
                key={virtualItem.index}
                ref={virtualItem.measureRef}
                rowId={rowId}
              />
            </RowIndexContext.Provider>
          </RowIdContext.Provider>
        );
      })}
      {paddingBottom > 0 && (
        <tr>
          <StyledSpace bottom={paddingBottom} />
        </tr>
      )}
    </tbody>
  );
};

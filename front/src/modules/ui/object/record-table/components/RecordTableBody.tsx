import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import {
  RecordTableRow,
  StyledRow,
} from '@/ui/object/record-table/components/RecordTableRow';
import { RowIdContext } from '@/ui/object/record-table/contexts/RowIdContext';
import { RowIndexContext } from '@/ui/object/record-table/contexts/RowIndexContext';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { isFetchingRecordTableDataState } from '@/ui/object/record-table/states/isFetchingRecordTableDataState';
import { tableRowIdsState } from '@/ui/object/record-table/states/tableRowIdsState';
import { getRecordTableScopedStates } from '@/ui/object/record-table/utils/getRecordTableScopedStates';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';
import RenderIfVisible from '@/ui/utilities/virtualizer/RenderIfVisible';

export const RecordTableBody = () => {
  const { scopeId } = useRecordTable();

  const onLastRowVisible = useRecoilCallback(
    ({ set }) =>
      async (inView: boolean) => {
        const { tableLastRowVisibleState } = getRecordTableScopedStates({
          recordTableScopeId: scopeId,
        });

        set(tableLastRowVisibleState, inView);
      },
    [scopeId],
  );

  const { ref: lastTableRowRef } = useInView({
    onChange: onLastRowVisible,
  });

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const [isFetchingMoreObjects] = useRecoilState(
    isFetchingMoreRecordsFamilyState(scopeId),
  );

  const isFetchingRecordTableData = useRecoilValue(
    isFetchingRecordTableDataState,
  );

  const lastRowId = tableRowIds[tableRowIds.length - 1];

  const scrollWrapperRef = useContext(ScrollWrapperContext);

  if (isFetchingRecordTableData) {
    return <></>;
  }

  return (
    <>
      {tableRowIds.map((rowId, rowIndex) => (
        <RowIdContext.Provider value={rowId} key={rowId}>
          <RowIndexContext.Provider value={rowIndex}>
            <RenderIfVisible
              rootElement="tbody"
              placeholderElement="tr"
              defaultHeight={32}
              initialVisible={rowIndex < 30}
              root={scrollWrapperRef.current}
            >
              <RecordTableRow
                key={rowId}
                ref={
                  rowId === lastRowId && rowIndex > 30
                    ? lastTableRowRef
                    : undefined
                }
                rowId={rowId}
              />
            </RenderIfVisible>
          </RowIndexContext.Provider>
        </RowIdContext.Provider>
      ))}
      <tbody>
        {isFetchingMoreObjects && (
          <StyledRow selected={false}>
            <td style={{ height: 50 }} colSpan={1000}>
              Loading more...
            </td>
          </StyledRow>
        )}
      </tbody>
    </>
  );
};

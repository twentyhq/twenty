import { useInView } from 'react-intersection-observer';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { StyledRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isFetchingRecordTableDataState } from '@/object-record/record-table/states/isFetchingRecordTableDataState';
import { getRecordTableScopedStates } from '@/object-record/record-table/utils/getRecordTableScopedStates';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';

export const RecordTableBodyFetchMoreLoader = () => {
  const { queryStateIdentifier } = useObjectRecordTable();
  const { scopeId } = useRecordTable();

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
  );

  const isFetchingRecordTableData = useRecoilValue(
    isFetchingRecordTableDataState,
  );

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

  const { ref: tbodyRef } = useInView({
    onChange: onLastRowVisible,
  });

  if (isFetchingRecordTableData) {
    return <></>;
  }

  return (
    <tbody ref={tbodyRef}>
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

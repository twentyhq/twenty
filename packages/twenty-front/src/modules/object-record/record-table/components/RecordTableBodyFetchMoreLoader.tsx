import { useInView } from 'react-intersection-observer';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { StyledRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';

export const RecordTableBodyFetchMoreLoader = () => {
  const { queryStateIdentifier } = useObjectRecordTable();
  const { setRecordTableLastRowVisible } = useRecordTable();

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
  );

  const onLastRowVisible = useRecoilCallback(
    () => async (inView: boolean) => {
      setRecordTableLastRowVisible(inView);
    },
    [setRecordTableLastRowVisible],
  );

  const { ref: tbodyRef } = useInView({
    onChange: onLastRowVisible,
  });

  return (
    <tbody ref={tbodyRef}>
      {isFetchingMoreObjects ? (
        <StyledRow selected={false}>
          <td style={{ height: 50 }} colSpan={1000}>
            Loading more...
          </td>
        </StyledRow>
      ) : null}
    </tbody>
  );
};

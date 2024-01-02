import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { StyledRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { getRecordTableScopedStates } from '@/object-record/record-table/utils/getRecordTableScopedStates';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { grayScale } from '@/ui/theme/constants/colors';

export const RecordTableBodyFetchMoreLoader = () => {
  const { queryStateIdentifier } = useObjectRecordTable();
  const { scopeId } = useRecordTable();

  const isFetchingMoreObjects = useRecoilValue(
    isFetchingMoreRecordsFamilyState(queryStateIdentifier),
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

  const StyledTransparentBox = styled.div`
    height: 32px;
    width: 32px;
  `;

  return (
    <tbody ref={tbodyRef}>
      {isFetchingMoreObjects ? (
        <StyledRow selected={false}>
          <StyledTransparentBox />
          <td
            style={{
              color: grayScale.gray40,
              height: 32,
              paddingLeft: 8,
            }}
            colSpan={1000}
          >
            Loading more...
          </td>
        </StyledRow>
      ) : null}
    </tbody>
  );
};

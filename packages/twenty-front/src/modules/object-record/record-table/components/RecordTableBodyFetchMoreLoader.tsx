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

  const StyledText = styled.div`
    align-items: center;
    box-shadow: none;
    color: ${grayScale.gray40};
    display: flex;
    height: 32px;
    padding-left: 40px;
  `;

  return (
    isFetchingMoreObjects && (
      <StyledRow selected={false}>
        <>
          <td colSpan={7}>
            <StyledText>Loading more...</StyledText>
          </td>
          <td colSpan={7} />
        </>
      </StyledRow>
    )
  );
};

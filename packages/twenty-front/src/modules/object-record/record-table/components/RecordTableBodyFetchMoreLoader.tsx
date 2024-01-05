import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useObjectRecordTable } from '@/object-record/hooks/useObjectRecordTable';
import { StyledRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { grayScale } from '@/ui/theme/constants/colors';

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

  const StyledText = styled.div`
    align-items: center;
    box-shadow: none;
    color: ${grayScale.gray40};
    display: flex;
    height: 32px;
    margin-left: ${({ theme }) => theme.spacing(8)};
    padding-left: ${({ theme }) => theme.spacing(2)};
  `;

  return (
    <tbody ref={tbodyRef}>
      {!isFetchingMoreObjects && (
        <StyledRow selected={false}>
          <td colSpan={7}>
            <StyledText>Loading more...</StyledText>
          </td>
          <td colSpan={7} />
        </StyledRow>
      )}
    </tbody>
  );
};

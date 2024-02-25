import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';

type RecordTableBodyFetchMoreLoaderProps = {
  objectNameSingular: string;
};

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${GRAY_SCALE.gray40};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const RecordTableBodyFetchMoreLoader = ({
  objectNameSingular,
}: RecordTableBodyFetchMoreLoaderProps) => {
  const { queryStateIdentifier } = useLoadRecordIndexTable(objectNameSingular);
  const { setRecordTableLastRowVisible } = useRecordTable();

  const isFetchingMoreRecords = useRecoilValue(
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
      {isFetchingMoreRecords && (
        <tr>
          <td colSpan={7}>
            <StyledText>Loading more...</StyledText>
          </td>
          <td colSpan={7} />
        </tr>
      )}
    </tbody>
  );
};

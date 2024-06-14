import { useContext, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { GRAY_SCALE } from 'twenty-ui';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${GRAY_SCALE.gray40};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const RecordBoardColumnFetchMoreLoader = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const { shouldFetchMoreInColumnFamilyState, isFetchingRecordsByColumnState } =
    useRecordBoardStates();

  const isFetchingRecord = useRecoilValue(
    isFetchingRecordsByColumnState({ columnId: columnDefinition.id }),
  );

  const setShouldFetchMore = useSetRecoilState(
    shouldFetchMoreInColumnFamilyState(columnDefinition.id),
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    setShouldFetchMore(inView);
  }, [setShouldFetchMore, inView]);

  return (
    <div ref={ref}>
      {isFetchingRecord && <StyledText>Loading more...</StyledText>}
    </div>
  );
};

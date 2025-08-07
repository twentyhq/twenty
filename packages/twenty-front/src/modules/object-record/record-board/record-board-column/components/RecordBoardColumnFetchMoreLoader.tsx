import styled from '@emotion/styled';
import { useContext, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilValue } from 'recoil';

import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { isRecordBoardFetchingRecordsByColumnFamilyState } from '@/object-record/record-board/states/isRecordBoardFetchingRecordsByColumnFamilyState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { useSetRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyState';
import { GRAY_SCALE } from 'twenty-ui/theme';

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

  const isFetchingRecord = useRecoilValue(
    isRecordBoardFetchingRecordsByColumnFamilyState(columnDefinition.id),
  );

  const setShouldFetchMore = useSetRecoilComponentFamilyState(
    recordBoardShouldFetchMoreInColumnComponentFamilyState,
    columnDefinition.id,
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

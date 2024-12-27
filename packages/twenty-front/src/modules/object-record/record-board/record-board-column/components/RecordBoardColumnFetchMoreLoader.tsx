import styled from '@emotion/styled';
import { useContext, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilValue } from 'recoil';
import { GRAY_SCALE } from 'twenty-ui';

import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { isRecordBoardFetchingRecordsByColumnFamilyState } from '@/object-record/record-board/states/isRecordBoardFetchingRecordsByColumnFamilyState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { isRecordIndexLoadMoreLockedComponentState } from '@/object-record/record-index/states/isRecordIndexLoadMoreLockedComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';

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

  const setShouldFetchMore = useSetRecoilComponentFamilyStateV2(
    recordBoardShouldFetchMoreInColumnComponentFamilyState,
    columnDefinition.id,
  );

  const isLoadMoreLocked = useRecoilComponentValueV2(
    isRecordIndexLoadMoreLockedComponentState,
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (isLoadMoreLocked) {
      return;
    }

    setShouldFetchMore(inView);
  }, [setShouldFetchMore, inView, isLoadMoreLocked]);

  if (isLoadMoreLocked) {
    return null;
  }

  return (
    <div ref={ref}>
      {isFetchingRecord && <StyledText>Loading more...</StyledText>}
    </div>
  );
};

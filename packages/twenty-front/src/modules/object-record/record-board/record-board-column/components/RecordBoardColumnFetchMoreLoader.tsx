import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { GRAY_SCALE } from 'twenty-ui';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';

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
  const { isFetchingRecordState, onFetchMoreVisibilityChangeState } =
    useRecordBoardStates();
  const isFetchingRecord = useRecoilValue(isFetchingRecordState);

  const onFetchMoreVisibilityChange = useRecoilValue(
    onFetchMoreVisibilityChangeState,
  );

  const { ref } = useInView({
    onChange: onFetchMoreVisibilityChange,
  });

  return (
    <div ref={ref}>
      {isFetchingRecord && <StyledText>Loading more...</StyledText>}
    </div>
  );
};

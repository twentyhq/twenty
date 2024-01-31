import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { grayScale } from '@/ui/theme/constants/colors';

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${grayScale.gray40};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const RecordBoardColumnFetchMoreLoader = () => {
  const { getIsFetchingRecordState } = useRecordBoardStates();
  const isFetchingRecords = useRecoilValue(getIsFetchingRecordState());

  const { onFetchMoreVisibilityChange } = useContext(RecordBoardContext);

  const { ref } = useInView({
    onChange: onFetchMoreVisibilityChange,
  });

  return (
    <div ref={ref}>
      {isFetchingRecords && <StyledText>Loading more...</StyledText>}
    </div>
  );
};

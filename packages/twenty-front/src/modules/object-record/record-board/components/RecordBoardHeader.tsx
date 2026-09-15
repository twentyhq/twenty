import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnDnd } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDnd';
import { getRecordBoardHeaderHtmlId } from '@/object-record/record-board/utils/getRecordBoardHeaderHtmlId';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  overflow: visible;

  width: 100%;
  z-index: 10;

  &.header-sticky {
    position: sticky;
    top: 0;
  }
`;

export const RecordBoardHeader = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  return (
    <StyledHeaderContainer id={getRecordBoardHeaderHtmlId(recordBoardId)}>
      <RecordBoardColumnDnd />
      <RecordIndexGroupAggregatesDataLoader />
    </StyledHeaderContainer>
  );
};

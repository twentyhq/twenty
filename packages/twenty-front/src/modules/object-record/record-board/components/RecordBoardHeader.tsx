import { RecordBoardColumnDnd } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDnd';
import { RecordIndexGroupAggregatesDataLoader } from '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader';
import { styled } from '@linaria/react';

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
  return (
    <StyledHeaderContainer id="record-board-header">
      <RecordBoardColumnDnd />
      <RecordIndexGroupAggregatesDataLoader />
    </StyledHeaderContainer>
  );
};

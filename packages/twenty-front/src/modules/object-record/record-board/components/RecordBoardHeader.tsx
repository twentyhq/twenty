import { useRecoilValue } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import styled from '@emotion/styled';

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  z-index: 10;

  overflow: visible;
  width: 100%;

  &.header-sticky {
    position: sticky;
    top: 0;
  }
`;

export const RecordBoardHeader = () => {
  const { columnIdsState } = useRecordBoardStates();

  const columnIds = useRecoilValue(columnIdsState);

  return (
    <StyledHeaderContainer id="record-board-header">
      {columnIds.map((columnId) => (
        <RecordBoardColumnHeaderWrapper columnId={columnId} />
      ))}
    </StyledHeaderContainer>
  );
};

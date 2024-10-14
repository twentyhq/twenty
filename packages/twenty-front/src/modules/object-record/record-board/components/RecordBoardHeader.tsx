import { useRecoilValue } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnHeaderWrapper } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderWrapper';
import styled from '@emotion/styled';

const StyledHeaderContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  height: 40px;

  overflow: visible;
  width: 100%;
`;

export const RecordBoardHeader = () => {
  const { columnIdsState } = useRecordBoardStates();

  const columnIds = useRecoilValue(columnIdsState);

  return (
    <StyledHeaderContainer>
      {columnIds.map((columnId) => (
        <RecordBoardColumnHeaderWrapper columnId={columnId} />
      ))}
    </StyledHeaderContainer>
  );
};

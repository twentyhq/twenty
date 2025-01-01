import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useCreateNewBoardRecord } from '@/object-record/record-board/hooks/useCreateNewBoardRecord';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { IconPlus } from 'twenty-ui';

const StyledNewButton = styled.button`
  align-items: center;
  align-self: baseline;
  background-color: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

export const RecordBoardColumnNewRecordButton = ({
  columnId,
}: {
  columnId: string;
}) => {
  const theme = useTheme();
  const { recordBoardId } = useContext(RecordBoardContext);
  const { createNewBoardRecord } = useCreateNewBoardRecord(recordBoardId);

  return (
    <StyledNewButton onClick={() => createNewBoardRecord(columnId, 'last')}>
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledNewButton>
  );
};

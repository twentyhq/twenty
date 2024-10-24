import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { useColumnNewCardActions } from '@/object-record/record-board/record-board-column/hooks/useColumnNewCardActions';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
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

export const RecordBoardColumnNewButton = ({
  columnId,
}: {
  columnId: string;
}) => {
  const theme = useTheme();

  const { newRecord, handleNewButtonClick, handleCreateSuccess } =
    useColumnNewCardActions(columnId);

  if (
    newRecord.isCreating &&
    newRecord.position === 'last' &&
    !newRecord.isOpportunity
  ) {
    return (
      <RecordBoardCard
        isCreating={true}
        onCreateSuccess={() => handleCreateSuccess('last')}
        position="last"
      />
    );
  }

  return (
    <StyledNewButton onClick={() => handleNewButtonClick('last', false)}>
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledNewButton>
  );
};

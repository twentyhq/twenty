import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { useColumnNewCardActions } from '@/object-record/record-board/record-board-column/hooks/useColumnNewCardActions';
import styled from '@emotion/styled';

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

export const RecordBoardColumnNewRecord = ({
  columnId,
  position,
}: {
  columnId: string;
  position: 'first' | 'last';
}) => {
  const { handleCreateSuccess, newRecord } = useColumnNewCardActions(columnId);

  return (
    <>
      {newRecord.isCreating && newRecord.position === position && (
        <RecordBoardCard
          isCreating={true}
          onCreateSuccess={() => handleCreateSuccess(position)}
          position={position}
        />
      )}
    </>
  );
};

import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { useColumnNewCardActions } from '@/object-record/record-board/record-board-column/hooks/useColumnNewCardActions';

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

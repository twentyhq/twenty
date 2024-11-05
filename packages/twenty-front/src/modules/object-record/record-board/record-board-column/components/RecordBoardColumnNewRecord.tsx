import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useRecoilValue } from 'recoil';

export const RecordBoardColumnNewRecord = ({
  columnId,
  position,
}: {
  columnId: string;
  position: 'first' | 'last';
}) => {
  const newRecord = useRecoilValue(
    recordBoardNewRecordByColumnIdSelector({
      familyKey: columnId,
      scopeId: columnId,
    }),
  );
  const { handleCreateSuccess } = useAddNewCard();

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

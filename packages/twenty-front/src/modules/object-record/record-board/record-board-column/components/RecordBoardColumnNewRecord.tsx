import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
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

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  if (hasObjectReadOnlyPermission) {
    return null;
  }

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

import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { recordBoardPendingRecordIdByColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardPendingRecordIdByColumnComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';

export const RecordBoardColumnNewRecord = ({
  columnId,
  position,
}: {
  columnId: string;
  position: 'first' | 'last';
}) => {
  const pendingRecord = useRecoilComponentFamilyValueV2(
    recordBoardPendingRecordIdByColumnComponentFamilyState,
    columnId,
  );

  return (
    <>
      {pendingRecord?.recordId &&
        pendingRecord.position === position &&
        !pendingRecord.isOpportunity && (
          <RecordBoardCardContext.Provider
            value={{ recordId: pendingRecord.recordId }}
          >
            <RecordBoardCard />
          </RecordBoardCardContext.Provider>
        )}
    </>
  );
};

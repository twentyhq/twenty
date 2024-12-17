import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { SingleRecordSelect } from '@/object-record/relation-picker/components/SingleRecordSelect';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useRecoilValue } from 'recoil';

export const RecordBoardColumnNewOpportunity = ({
  columnId,
  position,
}: {
  columnId: string;
  position: 'last' | 'first';
}) => {
  const newRecord = useRecoilValue(
    recordBoardNewRecordByColumnIdSelector({
      familyKey: columnId,
      scopeId: columnId,
    }),
  );
  const { handleCreateSuccess, handleEntitySelect } = useAddNewCard();

  return (
    <>
      {newRecord.isCreating && newRecord.position === position && (
        <OverlayContainer>
          <SingleRecordSelect
            onCancel={() => handleCreateSuccess(position, columnId, false)}
            onRecordSelected={(company) =>
              company ? handleEntitySelect(position, company) : null
            }
            objectNameSingular={CoreObjectNameSingular.Company}
            recordPickerInstanceId="relation-picker"
            selectedRecordIds={[]}
          />
        </OverlayContainer>
      )}
    </>
  );
};

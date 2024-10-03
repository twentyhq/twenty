import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useRecoilValue } from 'recoil';

export const useColumnNewCardActions = (columnId: string) => {
  const { visibleFieldDefinitionsState } = useRecordBoardStates();
  const visibleFieldDefinitions = useRecoilValue(
    visibleFieldDefinitionsState(),
  );
  const labelIdentifierField = visibleFieldDefinitions.find(
    (field) => field.isLabelIdentifier,
  );

  const { handleAddNewCardClick, handleCreateSuccess, handleEntitySelect } =
    useAddNewCard();

  const newRecord = useRecoilValue(
    recordBoardNewRecordByColumnIdSelector({
      familyKey: columnId,
      scopeId: columnId,
    }),
  );

  const handleNewButtonClick = (
    position: 'first' | 'last',
    isOpportunity: boolean,
  ) => {
    handleAddNewCardClick(
      labelIdentifierField?.label ?? '',
      '',
      position,
      isOpportunity,
      columnId,
    );
  };

  return {
    newRecord,
    handleNewButtonClick,
    handleCreateSuccess,
    handleEntitySelect,
  };
};

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { useAddNewOpportunity } from '@/object-record/record-board/record-board-column/hooks/useAddNewOpportunity';
import { recordBoardNewOpportunityByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewOpportunityByColumnIdSelector';
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

  const { handleAddNewCardClick, handleCreateSuccess } = useAddNewCard();
  const { handleAddNewOpportunityClick, handleEntitySelect, handleCancel } =
    useAddNewOpportunity();

  const newRecord = useRecoilValue(
    recordBoardNewRecordByColumnIdSelector({
      familyKey: columnId,
      scopeId: columnId,
    }),
  );

  const handleNewButtonClick = (position: 'first' | 'last') => {
    handleAddNewCardClick(
      labelIdentifierField?.label ?? '',
      '',
      position,
      columnId,
    );
  };
  const newOpportunity = useRecoilValue(
    recordBoardNewOpportunityByColumnIdSelector({
      familyKey: columnId,
      scopeId: columnId,
    }),
  );

  const handleNewOpportunityButtonClick = (position: 'first' | 'last') => {
    handleAddNewOpportunityClick(position, columnId);
  };

  return {
    newRecord,
    newOpportunity,
    handleNewButtonClick,
    handleCreateSuccess,
    handleNewOpportunityButtonClick,
    handleEntitySelect,
    handleCancel,
  };
};

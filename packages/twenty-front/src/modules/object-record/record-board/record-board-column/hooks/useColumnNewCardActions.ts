import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useColumnNewCardActions = (columnId: string) => {
  const visibleFieldDefinitions = useRecoilComponentValueV2(
    recordBoardVisibleFieldDefinitionsComponentSelector,
  );

  const labelIdentifierField = visibleFieldDefinitions.find(
    (field) => field.isLabelIdentifier,
  );

  const { handleAddNewCardClick } = useAddNewCard();

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
    handleNewButtonClick,
  };
};

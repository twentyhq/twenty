import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';

export const useColumnNewCardActions = (columnId: string) => {
  const { handleAddNewCardClick } = useAddNewCard({
    recordPickerComponentInstanceId: `add-new-card-record-picker-column-${columnId}`,
  });

  const handleNewButtonClick = (
    position: 'first' | 'last',
    isOpportunity: boolean,
  ) => {
    handleAddNewCardClick('', position, isOpportunity, columnId);
  };

  return {
    handleNewButtonClick,
  };
};

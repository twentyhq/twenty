import { useSelectAllCards } from '@/object-record/record-board/hooks/useSelectAllCards';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

export const useRecordBoardSelectAllHotkeys = ({
  recordBoardId,
  focusId,
}: {
  recordBoardId: string;
  focusId: string;
}) => {
  const { selectAllCards } = useSelectAllCards(recordBoardId);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+a', 'meta+a'],
    callback: selectAllCards,
    focusId,
    dependencies: [selectAllCards],
    options: {
      enableOnFormTags: false,
    },
  });
};

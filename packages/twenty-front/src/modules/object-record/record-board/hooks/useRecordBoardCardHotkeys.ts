import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useRecordBoardSelectAllHotkeys } from '@/object-record/record-board/hooks/useRecordBoardSelectAllHotkeys';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';

export const useRecordBoardCardHotkeys = (focusId: string) => {
  const { objectMetadataItem, recordBoardId } = useContext(RecordBoardContext);
  const { recordId, rowIndex, columnIndex } = useContext(
    RecordBoardCardContext,
  );

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();
  const { activateBoardCard } = useActiveRecordBoardCard();
  const { setRecordAsSelected, resetRecordSelection } =
    useRecordBoardSelection();
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const isRecordBoardCardSelected = useRecoilComponentFamilyValue(
    isRecordBoardCardSelectedComponentFamilyState,
    recordId,
  );

  const selectedRecordIds = useRecoilComponentValue(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const isAtLeastOneRecordSelected = selectedRecordIds.length > 0;

  const handleSelectCard = () => {
    setRecordAsSelected(recordId, !isRecordBoardCardSelected);
  };

  const handleOpenRecordInCommandMenu = () => {
    openRecordInCommandMenu({
      recordId,
      objectNameSingular: objectMetadataItem.nameSingular,
      isNewRecord: false,
    });

    activateBoardCard({
      rowIndex,
      columnIndex,
    });
  };

  const handleEscape = () => {
    unfocusBoardCard();
    if (isAtLeastOneRecordSelected) {
      resetRecordSelection();
    }
  };

  useHotkeysOnFocusedElement({
    keys: ['x'],
    callback: handleSelectCard,
    focusId,
    dependencies: [handleSelectCard],
  });

  useHotkeysOnFocusedElement({
    keys: [
      Key.Enter,
      `${Key.Control}+${Key.Enter}`,
      `${Key.Meta}+${Key.Enter}`,
    ],
    callback: handleOpenRecordInCommandMenu,
    focusId,
    dependencies: [handleOpenRecordInCommandMenu],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId,
    dependencies: [handleEscape],
  });

  useRecordBoardSelectAllHotkeys({
    recordBoardId,
    focusId,
  });
};

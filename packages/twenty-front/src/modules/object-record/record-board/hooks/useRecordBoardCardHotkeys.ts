import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useRecordBoardSelectAllHotkeys } from '@/object-record/record-board/hooks/useRecordBoardSelectAllHotkeys';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isAtLeastOneRecordSelectedComponentSelector } from '@/object-record/record-selection/states/selectors/isAtLeastOneRecordSelectedComponentSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';

export const useRecordBoardCardHotkeys = (focusId: string) => {
  const { objectMetadataItem, recordBoardId } = useContext(RecordBoardContext);
  const { recordId, rowIndex, columnIndex } = useContext(
    RecordBoardCardContext,
  );

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { activateBoardCard } = useActiveRecordBoardCard();
  const { toggleRecordSelection } = useToggleRecordSelection(recordBoardId);

  const { resetRecordSelection } = useResetRecordSelection();
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const isAtLeastOneRecordSelected = useAtomComponentSelectorValue(
    isAtLeastOneRecordSelectedComponentSelector,
    recordBoardId,
  );

  const handleSelectCard = () => {
    toggleRecordSelection({ recordId });
  };

  const handleSelectCardWithShift = () => {
    toggleRecordSelection({ recordId, shouldSelectRange: true });
  };

  const handleOpenRecordInSidePanel = () => {
    openRecordInSidePanel({
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
    keys: [`${Key.Shift}+x`],
    callback: handleSelectCardWithShift,
    focusId,
    dependencies: [handleSelectCardWithShift],
  });

  useHotkeysOnFocusedElement({
    keys: [
      Key.Enter,
      `${Key.Control}+${Key.Enter}`,
      `${Key.Meta}+${Key.Enter}`,
    ],
    callback: handleOpenRecordInSidePanel,
    focusId,
    dependencies: [handleOpenRecordInSidePanel],
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

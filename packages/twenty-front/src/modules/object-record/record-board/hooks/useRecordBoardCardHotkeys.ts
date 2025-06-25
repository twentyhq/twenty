import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useContext } from 'react';
import { Key } from 'ts-key-enum';

export const useRecordBoardCardHotkeys = (focusId: string) => {
  const { objectMetadataItem } = useContext(RecordBoardContext);
  const { recordId, rowIndex, columnIndex } = useContext(
    RecordBoardCardContext,
  );

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();
  const { activateBoardCard } = useActiveRecordBoardCard();
  const { setRecordAsSelected } = useRecordBoardSelection();

  const isRecordBoardCardSelected = useRecoilComponentFamilyValueV2(
    isRecordBoardCardSelectedComponentFamilyState,
    recordId,
  );

  const handleSelectCard = () => {
    setRecordAsSelected(recordId, !isRecordBoardCardSelected);
  };

  const handleOpenRecordInCommandMenu = () => {
    openRecordInCommandMenu({
      recordId: recordId,
      objectNameSingular: objectMetadataItem.nameSingular,
      isNewRecord: false,
    });

    activateBoardCard({
      rowIndex,
      columnIndex,
    });
  };

  useHotkeysOnFocusedElement({
    keys: ['x'],
    callback: handleSelectCard,
    focusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
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
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [handleOpenRecordInCommandMenu],
  });
};

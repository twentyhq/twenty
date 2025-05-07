import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveBoardCard } from '@/object-record/record-board/hooks/useActiveBoardCard';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { BoardHotkeyScope } from '@/object-record/record-board/types/BoardHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
export const RecordBoardCardFocusHotkeyEffect = () => {
  const { objectMetadataItem } = useContext(RecordBoardContext);

  const { recordId, rowIndex, columnIndex } = useContext(
    RecordBoardCardContext,
  );

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { activateBoardCard } = useActiveBoardCard();

  const { setRecordAsSelected } = useRecordBoardSelection();

  const isRecordBoardCardSelected = useRecoilComponentFamilyValueV2(
    isRecordBoardCardSelectedComponentFamilyState,
    recordId,
  );

  useScopedHotkeys(
    'x',
    () => {
      setRecordAsSelected(recordId, !isRecordBoardCardSelected);
    },
    BoardHotkeyScope.BoardFocus,
  );

  useScopedHotkeys(
    [Key.Enter, `${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    () => {
      openRecordInCommandMenu({
        recordId: recordId,
        objectNameSingular: objectMetadataItem.nameSingular,
        isNewRecord: false,
      });

      activateBoardCard({
        rowIndex,
        columnIndex,
      });
    },
    BoardHotkeyScope.BoardFocus,
  );

  return null;
};

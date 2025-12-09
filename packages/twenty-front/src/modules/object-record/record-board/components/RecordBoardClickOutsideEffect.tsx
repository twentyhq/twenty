import { ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/action-menu/constants/ActionMenuDropdownClickOutsideId';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-board/constants/RecordBoardClickOutsideListenerId';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { RECORD_BOARD_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardClickOutsideId';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';

import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from 'twenty-ui/components';

export const RecordBoardClickOutsideEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const isDraggingRecord = useRecoilComponentValue(
    isDraggingRecordComponentState,
  );

  const { deactivateBoardCard } = useActiveRecordBoardCard(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordBoardId);

  useListenClickOutside({
    excludedClickOutsideIds: [
      ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
      COMMAND_MENU_CLICK_OUTSIDE_ID,
      MODAL_BACKDROP_CLICK_OUTSIDE_ID,
      PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID,
      RECORD_BOARD_CARD_CLICK_OUTSIDE_ID,
      LINK_CHIP_CLICK_OUTSIDE_ID,
    ],
    listenerId: RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID,
    refs: [],
    callback: () => {
      if (!isDraggingRecord) {
        resetRecordBoardSelection();
        deactivateBoardCard();
        unfocusBoardCard();
      }
    },
  });

  return <></>;
};

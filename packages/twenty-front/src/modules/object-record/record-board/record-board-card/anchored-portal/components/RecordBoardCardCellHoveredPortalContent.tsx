import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { recordBoardCardEditModePositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardEditModePositionComponentState';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellHoveredPortalContent } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortalContent';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext } from 'react';

export const RecordBoardCardCellHoveredPortalContent = () => {
  const { editModeContentOnly, isCentered } = useRecordInlineCellContext();

  const { isRecordFieldReadOnly, recordId, fieldDefinition } =
    useContext(FieldContext);

  const { openInlineCell } = useInlineCell(
    getRecordFieldInputInstanceId({
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      prefix: RECORD_BOARD_CARD_INPUT_ID_PREFIX,
    }),
  );

  const shouldContainerBeClickable =
    !isRecordFieldReadOnly && !editModeContentOnly;

  const [recordBoardCardHoverPosition, setRecordBoardCardHoverPosition] =
    useRecoilComponentState(recordBoardCardHoverPositionComponentState);

  const setRecordBoardCardEditModePosition = useSetRecoilComponentState(
    recordBoardCardEditModePositionComponentState,
  );
  const { openFieldInput } = useOpenFieldInputEditMode();

  const handleClick = () => {
    if (shouldContainerBeClickable) {
      openInlineCell();
      setRecordBoardCardEditModePosition(recordBoardCardHoverPosition);

      openFieldInput({
        fieldDefinition,
        recordId,
        prefix: RECORD_BOARD_CARD_INPUT_ID_PREFIX,
      });
    }
  };

  const handleMouseLeave = () => {
    setRecordBoardCardHoverPosition(null);
  };

  return (
    <RecordInlineCellHoveredPortalContent
      readonly={isRecordFieldReadOnly}
      isCentered={isCentered}
      onMouseLeave={handleMouseLeave}
    >
      <RecordInlineCellDisplayMode isHovered={true} onClick={handleClick}>
        {editModeContentOnly ? <FieldInput /> : <FieldDisplay />}
      </RecordInlineCellDisplayMode>
    </RecordInlineCellHoveredPortalContent>
  );
};

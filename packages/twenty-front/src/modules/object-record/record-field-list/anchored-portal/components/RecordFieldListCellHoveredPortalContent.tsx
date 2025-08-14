import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellHoveredPortalContent } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortalContent';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext } from 'react';

export const RecordFieldListCellHoveredPortalContent = () => {
  const { editModeContentOnly, isCentered } = useRecordInlineCellContext();

  const { isRecordFieldReadOnly, recordId, fieldDefinition } =
    useContext(FieldContext);
  const { openInlineCell } = useInlineCell();

  const shouldContainerBeClickable =
    !isRecordFieldReadOnly && !editModeContentOnly;

  const [recordFieldListHoverPosition, setRecordFieldListHoverPosition] =
    useRecoilComponentState(recordFieldListHoverPositionComponentState);

  const setRecordFieldListCellEditModePosition = useSetRecoilComponentState(
    recordFieldListCellEditModePositionComponentState,
  );
  const { openFieldInput } = useOpenFieldInputEditMode();

  const handleClick = () => {
    if (shouldContainerBeClickable) {
      openInlineCell();
      setRecordFieldListCellEditModePosition(recordFieldListHoverPosition);

      openFieldInput({
        fieldDefinition,
        recordId,
        prefix: 'inline-cell',
      });
    }
  };

  const handleMouseLeave = () => {
    setRecordFieldListHoverPosition(null);
  };

  return (
    <RecordInlineCellHoveredPortalContent
      readonly={isRecordFieldReadOnly}
      isCentered={isCentered}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
    >
      <RecordInlineCellDisplayMode isHovered={true}>
        {editModeContentOnly ? <FieldInput /> : <FieldDisplay />}
      </RecordInlineCellDisplayMode>
    </RecordInlineCellHoveredPortalContent>
  );
};

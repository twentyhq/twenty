import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
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
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext } from 'react';

export const RecordFieldListCellHoveredPortalContent = () => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldListComponentInstanceContext,
  );

  const { editModeContentOnly, isCentered } = useRecordInlineCellContext();

  const { isRecordFieldReadOnly, recordId, fieldDefinition } =
    useContext(FieldContext);
  const { openInlineCell } = useInlineCell(
    getRecordFieldInputInstanceId({
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      prefix: instanceId,
    }),
  );

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
        prefix: instanceId,
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
      onMouseLeave={handleMouseLeave}
    >
      <RecordInlineCellDisplayMode isHovered={true} onClick={handleClick}>
        {editModeContentOnly ? <FieldInput /> : <FieldDisplay />}
      </RecordInlineCellDisplayMode>
    </RecordInlineCellHoveredPortalContent>
  );
};

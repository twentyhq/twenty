import { recordCalendarCardEditModePositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardEditModePositionComponentState';
import { recordCalendarCardHoverPositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardHoverPositionComponentState';
import { getRecordCalendarCardInstanceIdPrefix } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardInstanceIdPrefix';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellHoveredPortalContent } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortalContent';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';

type RecordCalendarCardCellHoveredPortalContentProps = {
  calendarDay: string;
};

export const RecordCalendarCardCellHoveredPortalContent = ({
  calendarDay,
}: RecordCalendarCardCellHoveredPortalContentProps) => {
  const { editModeContentOnly, isCentered } = useRecordInlineCellContext();

  const { isRecordFieldReadOnly, recordId, fieldDefinition } =
    useContext(FieldContext);

  const cardInstanceIdPrefix =
    getRecordCalendarCardInstanceIdPrefix(calendarDay);

  const { openInlineCell } = useInlineCell(
    getRecordFieldInputInstanceId({
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      prefix: cardInstanceIdPrefix,
    }),
  );

  const shouldContainerBeClickable =
    !isRecordFieldReadOnly && !editModeContentOnly;

  const [recordCalendarCardHoverPosition, setRecordCalendarCardHoverPosition] =
    useAtomComponentState(recordCalendarCardHoverPositionComponentState);

  const setRecordCalendarCardEditModePosition = useSetAtomComponentState(
    recordCalendarCardEditModePositionComponentState,
  );
  const { openFieldInput } = useOpenFieldInputEditMode();

  const handleClick = () => {
    if (shouldContainerBeClickable) {
      openInlineCell();
      setRecordCalendarCardEditModePosition(recordCalendarCardHoverPosition);

      openFieldInput({
        fieldDefinition,
        recordId,
        prefix: cardInstanceIdPrefix,
        onFileUploadClose: () => setRecordCalendarCardEditModePosition(null),
      });
    }
  };

  const handleMouseLeave = () => {
    setRecordCalendarCardHoverPosition(null);
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

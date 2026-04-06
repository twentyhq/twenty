import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellHoveredPortalContent } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortalContent';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { FieldWidgetInputContextProvider } from '@/page-layout/widgets/field/components/FieldWidgetInputContextProvider';
import { useIsFieldWidgetEditing } from '@/page-layout/widgets/field/hooks/useIsFieldWidgetEditing';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { fieldWidgetHoverComponentState } from '@/page-layout/widgets/field/states/fieldWidgetHoverComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext, useState } from 'react';

type FieldWidgetCellHoveredContentProps = {
  onMouseLeave: () => void;
};

export const FieldWidgetCellHoveredContent = ({
  onMouseLeave,
}: FieldWidgetCellHoveredContentProps) => {
  const { editModeContentOnly, isCentered } = useRecordInlineCellContext();
  const { isRecordFieldReadOnly, recordId, fieldDefinition } =
    useContext(FieldContext);

  const { openInlineCell } = useInlineCell();
  const { openFieldInput } = useOpenFieldWidgetFieldInputEditMode();
  const { isEditing } = useIsFieldWidgetEditing();
  const setFieldWidgetHover = useSetAtomComponentState(
    fieldWidgetHoverComponentState,
  );
  const [isActivating, setIsActivating] = useState(false);

  const shouldContainerBeClickable =
    !isRecordFieldReadOnly && !editModeContentOnly;

  if (isActivating) {
    return null;
  }

  const handleClick = () => {
    if (shouldContainerBeClickable) {
      setIsActivating(true);
      setFieldWidgetHover(false);
      openInlineCell();
      openFieldInput({
        fieldDefinition,
        recordId,
      });
    }
  };

  return (
    <RecordInlineCellHoveredPortalContent
      isDisabled={isActivating || isEditing}
      readonly={isRecordFieldReadOnly}
      isCentered={isCentered}
      onMouseLeave={onMouseLeave}
    >
      <RecordInlineCellDisplayMode isHovered={true} onClick={handleClick}>
        {editModeContentOnly ? (
          <FieldWidgetInputContextProvider>
            <FieldInput />
          </FieldWidgetInputContextProvider>
        ) : (
          <FieldDisplay />
        )}
      </RecordInlineCellDisplayMode>
    </RecordInlineCellHoveredPortalContent>
  );
};

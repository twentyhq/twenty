import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { FieldWidgetInputContextProvider } from '@/page-layout/widgets/field/components/FieldWidgetInputContextProvider';
import { useIsFieldWidgetEditing } from '@/page-layout/widgets/field/hooks/useIsFieldWidgetEditing';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { fieldWidgetHoverComponentState } from '@/page-layout/widgets/field/states/fieldWidgetHoverComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

type FieldWidgetCellEditModePortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
  recordId: string;
  instanceId: string;
};

export const FieldWidgetCellEditModePortal = ({
  objectMetadataItem,
  fieldMetadataItem,
  recordId,
  instanceId,
}: FieldWidgetCellEditModePortalProps) => {
  const { isEditing } = useIsFieldWidgetEditing();

  const setIsHovered = useSetRecoilComponentState(
    fieldWidgetHoverComponentState,
  );

  const { closeFieldInput } = useOpenFieldWidgetFieldInputEditMode();

  const handleCloseEditMode = () => {
    setIsHovered(false);

    closeFieldInput();
  };

  if (!isEditing) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={fieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={instanceId}
      onCloseEditMode={handleCloseEditMode}
    >
      <FieldWidgetInputContextProvider>
        <RecordInlineCellEditMode>
          <FieldInput />
        </RecordInlineCellEditMode>
      </FieldWidgetInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};

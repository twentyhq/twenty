import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { FieldWidgetInputContextProvider } from '@/page-layout/widgets/field/components/FieldWidgetInputContextProvider';
import { useIsFieldWidgetEditing } from '@/page-layout/widgets/field/hooks/useIsFieldWidgetEditing';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useOpenFieldWidgetFieldInputEditMode } from '@/page-layout/widgets/field/hooks/useOpenFieldWidgetFieldInputEditMode';
import { fieldWidgetHoverComponentState } from '@/page-layout/widgets/field/states/fieldWidgetHoverComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type FieldWidgetCellEditModePortalProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
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
  const fieldInstanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldMetadataItem.name,
    prefix: instanceId,
  });

  const { isEditing } = useIsFieldWidgetEditing(fieldInstanceId);
  const activeDropdownFocusId = useAtomStateValue(activeDropdownFocusIdState);
  const expectedDropdownFocusId = getDropdownFocusIdForRecordField({
    recordId,
    fieldMetadataId: fieldMetadataItem.id,
    componentType: 'inline-cell',
    instanceId,
  });
  const isDropdownFocused = activeDropdownFocusId === expectedDropdownFocusId;

  const setFieldWidgetHover = useSetAtomComponentState(
    fieldWidgetHoverComponentState,
  );

  const { closeFieldInput } = useOpenFieldWidgetFieldInputEditMode();

  const handleCloseEditMode = () => {
    setFieldWidgetHover(false);

    closeFieldInput();
  };

  if (!isEditing && !isDropdownFocused) {
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

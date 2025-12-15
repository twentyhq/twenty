import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { FieldWidgetInputContextProvider } from '@/page-layout/widgets/field/components/FieldWidgetInputContextProvider';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useRecoilValue } from 'recoil';

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
  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);
  const expectedDropdownFocusId = getDropdownFocusIdForRecordField(
    recordId,
    fieldMetadataItem.id,
    'inline-cell',
  );
  const isEditing = activeDropdownFocusId === expectedDropdownFocusId;

  if (!isEditing) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={fieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={instanceId}
    >
      <FieldWidgetInputContextProvider>
        <RecordInlineCellEditMode>
          <FieldInput />
        </RecordInlineCellEditMode>
      </FieldWidgetInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};

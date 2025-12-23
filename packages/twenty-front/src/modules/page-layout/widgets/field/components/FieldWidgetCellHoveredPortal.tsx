import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { FieldWidgetCellHoveredContent } from '@/page-layout/widgets/field/components/FieldWidgetCellHoveredContent';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useRecoilValue } from 'recoil';

type FieldWidgetCellHoveredPortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
  recordId: string;
  instanceId: string;
  isHovered: boolean;
  onMouseLeave: () => void;
};

export const FieldWidgetCellHoveredPortal = ({
  objectMetadataItem,
  fieldMetadataItem,
  recordId,
  instanceId,
  isHovered,
  onMouseLeave,
}: FieldWidgetCellHoveredPortalProps) => {
  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);
  const expectedDropdownFocusId = getDropdownFocusIdForRecordField({
    recordId,
    fieldMetadataId: fieldMetadataItem.id,
    componentType: 'inline-cell',
    instanceId,
  });
  const isEditing = activeDropdownFocusId === expectedDropdownFocusId;

  console.log('FieldWidgetCellHoveredPortal', {
    expectedDropdownFocusId,
    activeDropdownFocusId,
  });

  if (!isHovered || isEditing) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={fieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={instanceId}
    >
      <FieldWidgetCellHoveredContent onMouseLeave={onMouseLeave} />
    </RecordInlineCellAnchoredPortal>
  );
};

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { FieldWidgetCellHoveredContent } from '@/page-layout/widgets/field/components/FieldWidgetCellHoveredContent';
import { useIsFieldWidgetEditing } from '@/page-layout/widgets/field/hooks/useIsFieldWidgetEditing';

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
  const { isEditing } = useIsFieldWidgetEditing();

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

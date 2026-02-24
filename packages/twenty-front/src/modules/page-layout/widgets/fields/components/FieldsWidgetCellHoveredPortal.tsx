import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldListCellHoveredPortalContent } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortalContent';
import { RecordFieldListInputContextProvider } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListInputContextProvider';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

type FieldsWidgetCellHoveredPortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
  flattenedFieldMetadataItems: FieldMetadataItem[];
};

export const FieldsWidgetCellHoveredPortal = ({
  objectMetadataItem,
  recordId,
  flattenedFieldMetadataItems,
}: FieldsWidgetCellHoveredPortalProps) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldListComponentInstanceContext,
  );

  const hoverPosition = useRecoilComponentValueV2(
    recordFieldListHoverPositionComponentState,
  );

  const hoveredFieldMetadataItem = isDefined(hoverPosition)
    ? flattenedFieldMetadataItems.at(hoverPosition)
    : undefined;

  if (!isDefined(hoverPosition) || !isDefined(hoveredFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={hoveredFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={instanceId}
    >
      <RecordFieldListInputContextProvider
        fieldMetadataItem={hoveredFieldMetadataItem}
        objectMetadataItem={objectMetadataItem}
        recordId={recordId}
        instanceIdPrefix={instanceId}
      >
        <RecordFieldListCellHoveredPortalContent />
      </RecordFieldListInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};

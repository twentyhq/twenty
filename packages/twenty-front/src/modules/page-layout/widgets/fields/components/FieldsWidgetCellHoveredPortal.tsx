import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldListCellHoveredPortalContent } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortalContent';
import { RecordFieldListInputContextProvider } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListInputContextProvider';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { useFieldsWidgetFlattenedFields } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetFlattenedFields';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

type FieldsWidgetCellHoveredPortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
};

export const FieldsWidgetCellHoveredPortal = ({
  objectMetadataItem,
  recordId,
}: FieldsWidgetCellHoveredPortalProps) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldListComponentInstanceContext,
  );

  const hoverPosition = useRecoilComponentValue(
    recordFieldListHoverPositionComponentState,
  );

  const { flattenedFieldMetadataItems } = useFieldsWidgetFlattenedFields(
    objectMetadataItem.nameSingular,
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

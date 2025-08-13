import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { RecordFieldListCellAnchoredPortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellAnchoredPortal';
import { RecordFieldListCellHoveredPortalContent } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortalContent';
import { useFieldListFieldMetadataFromPosition } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataFromPosition';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { isDefined } from 'twenty-shared/utils';

export const RecordFieldListCellHoveredPortal = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const hoverPosition = useRecoilComponentValue(
    recordFieldListHoverPositionComponentState,
  );

  const { hoveredFieldMetadataItem } = useFieldListFieldMetadataFromPosition({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  if (!isDefined(hoverPosition) || !isDefined(hoveredFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordFieldListCellAnchoredPortal
      position={hoverPosition}
      fieldMetadataItem={hoveredFieldMetadataItem}
    >
      <RecordFieldListCellHoveredPortalContent />
    </RecordFieldListCellAnchoredPortal>
  );
};

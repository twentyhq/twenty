import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldListCellAnchoredPortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellAnchoredPortal';
import { RecordFieldListCellHoveredPortalContent } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortalContent';
import { useFieldListFieldMetadataFromPosition } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataFromPosition';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { isDefined } from 'twenty-shared/utils';

type RecordFieldListCellHoveredPortalProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const RecordFieldListCellHoveredPortal = ({
  objectMetadataItem,
}: RecordFieldListCellHoveredPortalProps) => {
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
      <RecordFieldListCellHoveredPortalContent
        objectMetadataItem={objectMetadataItem}
      />
    </RecordFieldListCellAnchoredPortal>
  );
};

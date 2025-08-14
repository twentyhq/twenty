import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFieldListCellHoveredPortalContent } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortalContent';
import { RecordFieldListInputContextProvider } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListInputContextProvider';
import { useFieldListFieldMetadataFromPosition } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataFromPosition';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { isDefined } from 'twenty-shared/utils';

type RecordDetailSectionCellHoveredPortalProps = {
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
};

export const RecordDetailSectionCellHoveredPortal = ({
  objectMetadataItem,
  recordId,
}: RecordDetailSectionCellHoveredPortalProps) => {
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
    <RecordInlineCellAnchoredPortal
      position={hoverPosition}
      fieldMetadataItem={hoveredFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      anchorIdPrefix={'record-field-list-inline-cell'}
    >
      <RecordFieldListInputContextProvider>
        <RecordFieldListCellHoveredPortalContent />
      </RecordFieldListInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};

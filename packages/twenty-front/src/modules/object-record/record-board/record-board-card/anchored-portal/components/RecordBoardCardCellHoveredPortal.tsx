import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardInputContextProvider } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardInputContextProvider';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { useRecordBoardCardMetadataFromPosition } from '@/object-record/record-board/record-board-card/hooks/useRecordBoardCardMetadataFromPosition';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { RecordBoardCardCellHoveredPortalContent } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellHoveredPortalContent';

export const RecordBoardCardCellHoveredPortal = () => {
  const { objectMetadataItem } = useContext(RecordBoardContext);
  const { recordId } = useContext(RecordBoardCardContext);

  const hoverPosition = useRecoilComponentValue(
    recordBoardCardHoverPositionComponentState,
  );

  const { hoveredFieldMetadataItem } = useRecordBoardCardMetadataFromPosition();

  if (!isDefined(hoverPosition) || !isDefined(hoveredFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      position={hoverPosition}
      fieldMetadataItem={hoveredFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      anchorIdPrefix={`record-board-card-body-${recordId}`}
    >
      <RecordBoardCardInputContextProvider>
        <RecordBoardCardCellHoveredPortalContent />
      </RecordBoardCardInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};

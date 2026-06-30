import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardCellHoveredPortalContent } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellHoveredPortalContent';
import { RecordBoardCardInputContextProvider } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardInputContextProvider';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { useRecordBoardCardMetadataFromPosition } from '@/object-record/record-board/record-board-card/hooks/useRecordBoardCardMetadataFromPosition';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordBoardCardCellHoveredPortal = () => {
  const { objectMetadataItem } = useContext(RecordBoardContext);
  const { recordId } = useContext(RecordBoardCardContext);

  const { hoveredFieldMetadataItem } = useRecordBoardCardMetadataFromPosition();

  if (!isDefined(hoveredFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={hoveredFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={RECORD_BOARD_CARD_INPUT_ID_PREFIX}
    >
      <RecordBoardCardInputContextProvider>
        <RecordBoardCardCellHoveredPortalContent />
      </RecordBoardCardInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};

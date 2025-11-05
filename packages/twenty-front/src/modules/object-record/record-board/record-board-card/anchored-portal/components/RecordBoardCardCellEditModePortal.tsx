import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardInputContextProvider } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardInputContextProvider';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { useRecordBoardCardMetadataFromPosition } from '@/object-record/record-board/record-board-card/hooks/useRecordBoardCardMetadataFromPosition';
import { recordBoardCardEditModePositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardEditModePositionComponentState';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordBoardCardCellEditModePortal = () => {
  const { objectMetadataItem } = useContext(RecordBoardContext);
  const { recordId } = useContext(RecordBoardCardContext);

  const editModePosition = useRecoilComponentValue(
    recordBoardCardEditModePositionComponentState,
  );

  const { editedFieldMetadataItem } = useRecordBoardCardMetadataFromPosition();

  if (!isDefined(editModePosition) || !isDefined(editedFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellAnchoredPortal
      fieldMetadataItem={editedFieldMetadataItem}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      instanceIdPrefix={RECORD_BOARD_CARD_INPUT_ID_PREFIX}
    >
      <RecordBoardCardInputContextProvider>
        <RecordInlineCellEditMode>
          <FieldInput />
        </RecordInlineCellEditMode>
      </RecordBoardCardInputContextProvider>
    </RecordInlineCellAnchoredPortal>
  );
};

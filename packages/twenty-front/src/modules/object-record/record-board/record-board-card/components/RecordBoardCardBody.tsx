import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { RecordCardField } from '@/object-record/record-card/components/RecordCardField';
import { useRecordCardVisibleRecordFields } from '@/object-record/record-card/hooks/useRecordCardVisibleRecordFields';
import {
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';

export const RecordBoardCardBody = () => {
  const { recordId, isRecordReadOnly, isDragOverlay } = useContext(
    RecordBoardCardContext,
  );

  const { updateOneRecord } = useContext(RecordBoardContext);

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const visibleRecordFields = useRecordCardVisibleRecordFields();

  const setRecordBoardCardHoverPosition = useSetAtomComponentState(
    recordBoardCardHoverPositionComponentState,
  );

  return (
    <RecordCardBodyContainer>
      {visibleRecordFields.map((recordField, index) => (
        <StopPropagationContainer key={recordField.id}>
          <RecordCardField
            recordField={recordField}
            recordId={recordId}
            isRecordReadOnly={isRecordReadOnly}
            cardInstanceIdPrefix={RECORD_BOARD_CARD_INPUT_ID_PREFIX}
            useUpdateRecord={useUpdateOneRecordHook}
            onMouseEnter={() => setRecordBoardCardHoverPosition(index)}
            hasAnchor={!isDragOverlay}
          />
        </StopPropagationContainer>
      ))}
    </RecordCardBodyContainer>
  );
};

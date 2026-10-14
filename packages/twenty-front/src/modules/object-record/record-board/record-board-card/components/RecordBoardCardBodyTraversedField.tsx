import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { useTraversedRecordFieldContextValue } from '@/object-record/record-field/hooks/useTraversedRecordFieldContextValue';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { isDefined } from 'twenty-shared/utils';

type RecordBoardCardBodyTraversedFieldProps = {
  recordField: RecordField;
  rowRecordId: string;
  onMouseEnter: () => void;
};

export const RecordBoardCardBodyTraversedField = ({
  recordField,
  rowRecordId,
  onMouseEnter,
}: RecordBoardCardBodyTraversedFieldProps) => {
  const fieldContextValue = useTraversedRecordFieldContextValue({
    recordField,
    rowRecordId,
  });

  if (!isDefined(fieldContextValue)) {
    return null;
  }

  return (
    <StopPropagationContainer>
      <FieldContext.Provider
        value={{
          ...fieldContextValue,
          maxWidth: 156,
          isDisplayModeFixHeight: true,
          triggerEvent: 'CLICK',
          onMouseEnter,
        }}
      >
        <RecordFieldComponentInstanceContext.Provider
          value={{
            instanceId: getRecordFieldInputInstanceId({
              recordId: rowRecordId,
              fieldName: getRecordFieldKey(recordField),
              prefix: RECORD_BOARD_CARD_INPUT_ID_PREFIX,
            }),
          }}
        >
          <RecordInlineCell instanceIdPrefix={RECORD_BOARD_CARD_INPUT_ID_PREFIX} />
        </RecordFieldComponentInstanceContext.Provider>
      </FieldContext.Provider>
    </StopPropagationContainer>
  );
};

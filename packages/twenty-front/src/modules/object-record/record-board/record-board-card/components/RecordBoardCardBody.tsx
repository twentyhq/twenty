import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import {
  FieldContext,
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext } from 'react';

export const RecordBoardCardBody = () => {
  const { recordId, isRecordReadOnly } = useContext(RecordBoardCardContext);

  const { updateOneRecord, objectPermissions } = useContext(RecordBoardContext);

  const {
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const visibleRecordFieldsExceptLabelIdentifier = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  );

  const setRecordBoardCardHoverPosition = useSetRecoilComponentState(
    recordBoardCardHoverPositionComponentState,
  );

  const handleMouseEnter = (index: number) => {
    setRecordBoardCardHoverPosition(index);
  };

  return (
    <RecordCardBodyContainer>
      {visibleRecordFieldsExceptLabelIdentifier.map((recordField, index) => {
        const correspondingFieldDefinition =
          fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

        return (
          <StopPropagationContainer key={recordField.fieldMetadataItemId}>
            <FieldContext.Provider
              value={{
                recordId,
                maxWidth: 156,
                isLabelIdentifier: false,
                isRecordFieldReadOnly: isRecordFieldReadOnly({
                  isRecordReadOnly,
                  objectPermissions,
                  fieldMetadataItem: {
                    id: recordField.fieldMetadataItemId,
                    isUIReadOnly:
                      correspondingFieldDefinition.metadata.isUIReadOnly ??
                      false,
                  },
                }),
                fieldDefinition: correspondingFieldDefinition,
                useUpdateRecord: useUpdateOneRecordHook,
                isDisplayModeFixHeight: true,
                triggerEvent: 'CLICK',
                anchorId: `${RECORD_BOARD_CARD_INPUT_ID_PREFIX}-${recordId}-${correspondingFieldDefinition.metadata.fieldName}`,
                onMouseEnter: () => handleMouseEnter(index),
              }}
            >
              <RecordFieldComponentInstanceContext.Provider
                value={{
                  instanceId: getRecordFieldInputInstanceId({
                    recordId,
                    fieldName: correspondingFieldDefinition.metadata.fieldName,
                    prefix: RECORD_BOARD_CARD_INPUT_ID_PREFIX,
                  }),
                }}
              >
                <RecordInlineCell
                  instanceIdPrefix={RECORD_BOARD_CARD_INPUT_ID_PREFIX}
                />
              </RecordFieldComponentInstanceContext.Provider>
            </FieldContext.Provider>
          </StopPropagationContainer>
        );
      })}
    </RecordCardBodyContainer>
  );
};

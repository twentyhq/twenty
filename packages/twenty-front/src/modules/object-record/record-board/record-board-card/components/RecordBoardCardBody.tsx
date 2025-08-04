import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardBodyContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardBodyContainer';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { isRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useContext } from 'react';

export const RecordBoardCardBody = ({
  fieldDefinitions,
}: {
  fieldDefinitions: RecordBoardFieldDefinition<FieldMetadata>[];
}) => {
  const { recordId, isRecordReadOnly } = useContext(RecordBoardCardContext);

  const { updateOneRecord, objectPermissions } = useContext(RecordBoardContext);

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const fieldDefinitionsWithReadOnly = fieldDefinitions.map(
    (fieldDefinition) => ({
      ...fieldDefinition,
      isRecordFieldReadOnly: isRecordFieldReadOnly({
        isRecordReadOnly,
        objectPermissions,
        fieldMetadataId: fieldDefinition.fieldMetadataId,
        fieldName: fieldDefinition.metadata.fieldName,
        fieldType: fieldDefinition.type,
        isCustom: fieldDefinition.metadata.isCustom,
        objectNameSingular:
          fieldDefinition.metadata.objectMetadataNameSingular ?? '',
      }),
    }),
  );

  return (
    <RecordBoardCardBodyContainer>
      {fieldDefinitionsWithReadOnly.map((fieldDefinition) => (
        <StopPropagationContainer key={fieldDefinition.fieldMetadataId}>
          <FieldContext.Provider
            value={{
              recordId,
              maxWidth: 156,
              isLabelIdentifier: false,
              isRecordFieldReadOnly: fieldDefinition.isRecordFieldReadOnly,
              fieldDefinition: {
                disableTooltip: false,
                fieldMetadataId: fieldDefinition.fieldMetadataId,
                label: fieldDefinition.label,
                iconName: fieldDefinition.iconName,
                type: fieldDefinition.type,
                metadata: fieldDefinition.metadata,
                defaultValue: fieldDefinition.defaultValue,
                editButtonIcon: getFieldButtonIcon({
                  metadata: fieldDefinition.metadata,
                  type: fieldDefinition.type,
                }),
              },
              useUpdateRecord: useUpdateOneRecordHook,
              isDisplayModeFixHeight: true,
              triggerEvent: 'CLICK',
            }}
          >
            <RecordFieldComponentInstanceContext.Provider
              value={{
                instanceId: getRecordFieldInputInstanceId({
                  recordId,
                  fieldName: fieldDefinition.metadata.fieldName,
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
      ))}
    </RecordBoardCardBodyContainer>
  );
};

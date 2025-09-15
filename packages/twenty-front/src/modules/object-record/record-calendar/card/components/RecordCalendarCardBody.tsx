import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

type RecordCalendarCardBodyProps = {
  recordId: string;
  isRecordReadOnly: boolean;
};

export const RecordCalendarCardBody = ({
  recordId,
  isRecordReadOnly,
}: RecordCalendarCardBodyProps) => {
  const { objectPermissions } = useRecordCalendarContextOrThrow();

  const {
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const visibleRecordFieldsExceptLabelIdentifier = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  );

  return (
    <RecordCardBodyContainer>
      {visibleRecordFieldsExceptLabelIdentifier.map((recordField) => {
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
                useUpdateRecord: () => [() => undefined, { loading: false }],
                isDisplayModeFixHeight: true,
                triggerEvent: 'CLICK',
                anchorId: `${RECORD_BOARD_CARD_INPUT_ID_PREFIX}-${recordId}-${correspondingFieldDefinition.metadata.fieldName}`,
                onMouseEnter: () => {},
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

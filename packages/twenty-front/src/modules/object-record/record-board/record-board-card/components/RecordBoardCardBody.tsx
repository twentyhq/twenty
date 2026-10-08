import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { recordBoardCardEditModePositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardEditModePositionComponentState';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { getIsOnDemandFieldEnabled } from '@/object-record/record-field/on-demand/utils/getIsOnDemandFieldEnabled';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import {
  FieldContext,
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordBoardCardBody = () => {
  const { recordId, isRecordReadOnly, isDragOverlay } = useContext(
    RecordBoardCardContext,
  );

  const { updateOneRecord, objectMetadataItem } =
    useContext(RecordBoardContext);

  const {
    labelIdentifierFieldMetadataItem,
    fieldMetadataItemByFieldMetadataItemId,
    fieldDefinitionByFieldMetadataItemId,
    objectPermissionsByObjectMetadataId,
    isOnDemandFieldsEnabled,
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

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const visibleRecordFieldsExceptLabelIdentifier = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  );

  const setRecordBoardCardHoverPosition = useSetAtomComponentState(
    recordBoardCardHoverPositionComponentState,
  );

  const initDraftValue = useInitDraftValue();
  const { openFieldInput } = useOpenFieldInputEditMode();
  const setRecordBoardCardEditModePosition = useSetAtomComponentState(
    recordBoardCardEditModePositionComponentState,
  );
  const isRecordBoardCellsNonEditable = useAtomComponentStateValue(
    isRecordBoardCellsNonEditableComponentState,
  );

  const openFieldEditMode = ({
    fieldDefinition,
    position,
  }: {
    fieldDefinition: FieldDefinition<FieldMetadata>;
    position: number;
  }) => {
    initDraftValue({
      recordId,
      fieldDefinition,
      fieldComponentInstanceId: getRecordFieldInputInstanceId({
        recordId,
        fieldName: fieldDefinition.metadata.fieldName,
        prefix: RECORD_BOARD_CARD_INPUT_ID_PREFIX,
      }),
    });
    setRecordBoardCardEditModePosition(position);
    openFieldInput({
      fieldDefinition,
      recordId,
      prefix: RECORD_BOARD_CARD_INPUT_ID_PREFIX,
    });
  };

  const handleMouseEnter = (index: number) => {
    setRecordBoardCardHoverPosition(index);
  };

  return (
    <RecordCardBodyContainer>
      {visibleRecordFieldsExceptLabelIdentifier.map((recordField, index) => {
        const correspondingFieldDefinition =
          fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];
        const fieldMetadataItem =
          fieldMetadataItemByFieldMetadataItemId[
            recordField.fieldMetadataItemId
          ];

        if (
          !isDefined(correspondingFieldDefinition) ||
          !isDefined(fieldMetadataItem)
        ) {
          return null;
        }

        const isOnDemand = getIsOnDemandFieldEnabled({
          isOnDemandFieldsEnabled,
          fieldMetadataItem,
        });

        return (
          <StopPropagationContainer
            key={
              isOnDemand
                ? `${recordField.fieldMetadataItemId}-${index}`
                : recordField.fieldMetadataItemId
            }
          >
            <FieldContext.Provider
              value={{
                recordId,
                maxWidth: 156,
                isLabelIdentifier: false,
                isOnDemand,
                isRecordFieldReadOnly:
                  (isOnDemand && isRecordBoardCellsNonEditable) ||
                  isRecordFieldReadOnly({
                    isRecordReadOnly,
                    objectMetadataId: objectMetadataItem.id,
                    fieldMetadataItem,
                    fieldDefinition: correspondingFieldDefinition,
                    objectPermissionsByObjectMetadataId,
                  }),
                onOpenEditMode: isOnDemand
                  ? () =>
                      openFieldEditMode({
                        fieldDefinition: correspondingFieldDefinition,
                        position: index,
                      })
                  : undefined,
                fieldDefinition: correspondingFieldDefinition,
                useUpdateRecord: useUpdateOneRecordHook,
                isDisplayModeFixHeight: true,
                triggerEvent: 'CLICK',
                anchorId: isDragOverlay
                  ? undefined
                  : `${RECORD_BOARD_CARD_INPUT_ID_PREFIX}-${recordId}-${correspondingFieldDefinition.metadata.fieldName}`,
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

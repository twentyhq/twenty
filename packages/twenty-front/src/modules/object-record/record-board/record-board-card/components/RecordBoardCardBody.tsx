import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RECORD_BOARD_CARD_INPUT_ID_PREFIX } from '@/object-record/record-board/record-board-card/constants/RecordBoardCardInputIdPrefix';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { getRecordCardFieldInstanceIdPrefix } from '@/object-record/record-card/utils/getRecordCardFieldInstanceIdPrefix';
import { RecordFieldLookupFieldContext } from '@/object-record/record-column-lookup/components/RecordFieldLookupFieldContext';
import { getRecordFieldColumnDisplay } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnDisplay';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { getScopedRelationAlias } from '@/object-record/record-column-scope/utils/getScopedRelationAlias';
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
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';
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

  const { objectMetadataItems } = useObjectMetadataItems();

  const scopedRelationAliases = useScopedRelationAliases();

  const isColumnSettingsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COLUMN_SETTINGS_ENABLED,
  );

  const visibleRecordFieldsExceptLabelIdentifier = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  );

  const setRecordBoardCardHoverPosition = useSetAtomComponentState(
    recordBoardCardHoverPositionComponentState,
  );

  const handleMouseEnter = (index: number) => {
    setRecordBoardCardHoverPosition(index);
  };

  const restrictedFieldNames = useRecordRestrictedFieldNames(recordId);

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

        const isFieldRestricted = restrictedFieldNames.includes(
          fieldMetadataItem.name,
        );

        const fieldInstanceIdPrefix = getRecordCardFieldInstanceIdPrefix({
          cardInstanceIdPrefix: RECORD_BOARD_CARD_INPUT_ID_PREFIX,
          recordField,
        });

        const anchorId = isDragOverlay
          ? undefined
          : `${fieldInstanceIdPrefix}-${recordId}-${correspondingFieldDefinition.metadata.fieldName}`;

        const lookupTarget = isColumnSettingsEnabled
          ? getRecordFieldLookupTarget({
              recordField,
              fieldMetadataItem,
              objectMetadataItems,
            })
          : undefined;

        const { label } = getRecordFieldColumnDisplay({
          recordField,
          fieldMetadataItem,
          objectMetadataItems,
        });

        if (isDefined(lookupTarget)) {
          // Two cards can show the same related record, so the cell instance is keyed by the card's record too
          const lookupInstanceIdPrefix = `${fieldInstanceIdPrefix}-${recordId}`;

          return (
            <StopPropagationContainer key={recordField.id}>
              <RecordFieldLookupFieldContext
                recordId={recordId}
                fieldMetadataItem={fieldMetadataItem}
                relationObjectMetadataItem={
                  lookupTarget.relationObjectMetadataItem
                }
                lookupTargetFieldMetadataItem={
                  lookupTarget.lookupTargetFieldMetadataItem
                }
                instanceIdPrefix={lookupInstanceIdPrefix}
                isNonEditable
                label={label}
                fieldContextOverrides={{
                  maxWidth: 156,
                  isDisplayModeFixHeight: true,
                  triggerEvent: 'CLICK',
                  anchorId,
                }}
              >
                <RecordInlineCell instanceIdPrefix={lookupInstanceIdPrefix} />
              </RecordFieldLookupFieldContext>
            </StopPropagationContainer>
          );
        }

        // The card's hover and edit portals find a cell by field, so an added column stays read-only here
        const isAddedColumn = !isCanonicalRecordField(recordField);

        const isScopedRelation = scopedRelationAliases.some(
          ({ alias }) => alias === getScopedRelationAlias(recordField.id),
        );

        return (
          <StopPropagationContainer key={recordField.id}>
            <FieldContext.Provider
              value={{
                recordId,
                maxWidth: 156,
                isLabelIdentifier: false,
                isForbidden: isFieldRestricted,
                isRecordFieldReadOnly:
                  isAddedColumn ||
                  isFieldRestricted ||
                  isRecordFieldReadOnly({
                    isRecordReadOnly,
                    objectMetadataId: objectMetadataItem.id,
                    fieldMetadataItem,
                    fieldDefinition: correspondingFieldDefinition,
                    objectPermissionsByObjectMetadataId,
                  }),
                fieldDefinition: { ...correspondingFieldDefinition, label },
                useUpdateRecord: useUpdateOneRecordHook,
                isDisplayModeFixHeight: true,
                triggerEvent: 'CLICK',
                anchorId,
                scopedRelationViewFieldId: isScopedRelation
                  ? recordField.id
                  : undefined,
                onMouseEnter: isAddedColumn
                  ? undefined
                  : () => handleMouseEnter(index),
              }}
            >
              <RecordFieldComponentInstanceContext.Provider
                value={{
                  instanceId: getRecordFieldInputInstanceId({
                    recordId,
                    fieldName: correspondingFieldDefinition.metadata.fieldName,
                    prefix: fieldInstanceIdPrefix,
                  }),
                }}
              >
                <RecordInlineCell instanceIdPrefix={fieldInstanceIdPrefix} />
              </RecordFieldComponentInstanceContext.Provider>
            </FieldContext.Provider>
          </StopPropagationContainer>
        );
      })}
    </RecordCardBodyContainer>
  );
};

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { recordCalendarCardEditModePositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardEditModePositionComponentState';
import { recordCalendarCardHoverPositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardHoverPositionComponentState';
import { getRecordCalendarCardInstanceIdPrefix } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardInstanceIdPrefix';
import { RecordCardBodyContainer } from '@/object-record/record-card/components/RecordCardBodyContainer';
import { useOpenRecordCardFieldEditMode } from '@/object-record/record-card/hooks/useOpenRecordCardFieldEditMode';
import { getIsOnDemandFieldEnabled } from '@/object-record/record-field/on-demand/utils/getIsOnDemandFieldEnabled';
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
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

type RecordCalendarCardBodyProps = {
  recordId: string;
  calendarDay: string;
  isRecordReadOnly: boolean;
};

export const RecordCalendarCardBody = ({
  recordId,
  calendarDay,
  isRecordReadOnly,
}: RecordCalendarCardBodyProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const cardInstanceIdPrefix =
    getRecordCalendarCardInstanceIdPrefix(calendarDay);

  const { updateOneRecord } = useUpdateOneRecord();

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord({
        objectNameSingular: objectMetadataItem.nameSingular,
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const {
    labelIdentifierFieldMetadataItem,
    fieldMetadataItemByFieldMetadataItemId,
    fieldDefinitionByFieldMetadataItemId,
    objectPermissionsByObjectMetadataId,
    isOnDemandFieldsEnabled,
  } = useRecordIndexContextOrThrow();

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const visibleRecordFieldsExceptLabelIdentifier = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  );

  const setRecordCalendarCardHoverPosition = useSetAtomComponentState(
    recordCalendarCardHoverPositionComponentState,
  );

  const setRecordCalendarCardEditModePosition = useSetAtomComponentState(
    recordCalendarCardEditModePositionComponentState,
  );
  const { openRecordCardFieldEditMode } = useOpenRecordCardFieldEditMode({
    recordId,
    prefix: cardInstanceIdPrefix,
    setEditModePosition: setRecordCalendarCardEditModePosition,
  });

  const handleMouseEnter = (index: number) => {
    setRecordCalendarCardHoverPosition(index);
  };

  return (
    <RecordCardBodyContainer
      padding={`0 ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}`}
    >
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
                isRecordFieldReadOnly: isRecordFieldReadOnly({
                  isRecordReadOnly,
                  objectMetadataId: objectMetadataItem.id,
                  fieldMetadataItem,
                  fieldDefinition: correspondingFieldDefinition,
                  objectPermissionsByObjectMetadataId,
                }),
                onOpenEditMode: isOnDemand
                  ? () =>
                      openRecordCardFieldEditMode({
                        fieldDefinition: correspondingFieldDefinition,
                        position: index,
                      })
                  : undefined,
                fieldDefinition: correspondingFieldDefinition,
                useUpdateRecord: useUpdateOneRecordHook,
                isDisplayModeFixHeight: true,
                triggerEvent: 'CLICK',
                anchorId: `${cardInstanceIdPrefix}-${recordId}-${correspondingFieldDefinition.metadata.fieldName}`,
                onMouseEnter: () => handleMouseEnter(index),
              }}
            >
              <RecordFieldComponentInstanceContext.Provider
                value={{
                  instanceId: getRecordFieldInputInstanceId({
                    recordId,
                    fieldName: correspondingFieldDefinition.metadata.fieldName,
                    prefix: cardInstanceIdPrefix,
                  }),
                }}
              >
                <RecordInlineCell instanceIdPrefix={cardInstanceIdPrefix} />
              </RecordFieldComponentInstanceContext.Provider>
            </FieldContext.Provider>
          </StopPropagationContainer>
        );
      })}
    </RecordCardBodyContainer>
  );
};

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RECORD_CALENDAR_CARD_INPUT_ID_PREFIX } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardInputIdPrefix';
import { recordCalendarCardHoverPositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardHoverPositionComponentState';
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
import styled from '@emotion/styled';

const StyledRecordCardBodyContainer = styled(RecordCardBodyContainer)`
  padding: ${({ theme }) => theme.spacing(1)};
`;

type RecordCalendarCardBodyProps = {
  recordId: string;
  isRecordReadOnly: boolean;
};

export const RecordCalendarCardBody = ({
  recordId,
  isRecordReadOnly,
}: RecordCalendarCardBodyProps) => {
  const { objectPermissions, objectMetadataItem } =
    useRecordCalendarContextOrThrow();

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

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

  const setRecordCalendarCardHoverPosition = useSetRecoilComponentState(
    recordCalendarCardHoverPositionComponentState,
  );

  const handleMouseEnter = (index: number) => {
    setRecordCalendarCardHoverPosition(index);
  };

  return (
    <StyledRecordCardBodyContainer>
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
                anchorId: `${RECORD_CALENDAR_CARD_INPUT_ID_PREFIX}-${recordId}-${correspondingFieldDefinition.metadata.fieldName}`,
                onMouseEnter: () => handleMouseEnter(index),
              }}
            >
              <RecordFieldComponentInstanceContext.Provider
                value={{
                  instanceId: getRecordFieldInputInstanceId({
                    recordId,
                    fieldName: correspondingFieldDefinition.metadata.fieldName,
                    prefix: RECORD_CALENDAR_CARD_INPUT_ID_PREFIX,
                  }),
                }}
              >
                <RecordInlineCell
                  instanceIdPrefix={RECORD_CALENDAR_CARD_INPUT_ID_PREFIX}
                />
              </RecordFieldComponentInstanceContext.Provider>
            </FieldContext.Provider>
          </StopPropagationContainer>
        );
      })}
    </StyledRecordCardBodyContainer>
  );
};

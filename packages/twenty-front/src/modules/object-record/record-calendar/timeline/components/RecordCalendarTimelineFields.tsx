import { RECORD_CALENDAR_TIMELINE_INPUT_ID_PREFIX } from '@/object-record/record-calendar/timeline/constants/RecordCalendarTimelineInputIdPrefix';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledFields = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 auto;
  justify-content: flex-end;
  margin-left: auto;
  min-width: 0;
  overflow: hidden;
`;

const StyledField = styled.div`
  flex: 0 1 auto;
  max-width: 160px;
  min-width: 0;
`;

type RecordCalendarTimelineFieldsProps = {
  recordId: string;
};

export const RecordCalendarTimelineFields = ({
  recordId,
}: RecordCalendarTimelineFieldsProps) => {
  const {
    fieldDefinitionByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
  } = useRecordIndexContextOrThrow();
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const fieldDefinitions = visibleRecordFields
    .filter(
      ({ fieldMetadataItemId }) =>
        fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
    )
    .map(
      ({ fieldMetadataItemId }) =>
        fieldDefinitionByFieldMetadataItemId[fieldMetadataItemId],
    )
    .filter(isDefined);

  return (
    <StyledFields>
      {fieldDefinitions.map((fieldDefinition) => (
        <StyledField key={fieldDefinition.fieldMetadataId}>
          <FieldContext.Provider
            value={{
              recordId,
              maxWidth: 156,
              isLabelIdentifier: false,
              isRecordFieldReadOnly: true,
              fieldDefinition,
              isDisplayModeFixHeight: true,
              disableChipClick: true,
              triggerEvent: 'CLICK',
            }}
          >
            <RecordFieldComponentInstanceContext.Provider
              value={{
                instanceId: getRecordFieldInputInstanceId({
                  recordId,
                  fieldName: fieldDefinition.metadata.fieldName,
                  prefix: RECORD_CALENDAR_TIMELINE_INPUT_ID_PREFIX,
                }),
              }}
            >
              <RecordInlineCell
                instanceIdPrefix={RECORD_CALENDAR_TIMELINE_INPUT_ID_PREFIX}
              />
            </RecordFieldComponentInstanceContext.Provider>
          </FieldContext.Provider>
        </StyledField>
      ))}
    </StyledFields>
  );
};

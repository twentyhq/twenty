import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_LIST_ROW_FIELD_ANCHOR_CLASS_NAME } from '@/object-record/record-list/constants/RecordListRowFieldAnchorClassName';
import { RECORD_LIST_ROW_FIELD_MAX_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMaxWidth';
import { RECORD_LIST_ROW_INPUT_ID_PREFIX } from '@/object-record/record-list/constants/RecordListRowInputIdPrefix';
import { recordListHoveredFieldMetadataItemIdComponentState } from '@/object-record/record-list/states/recordListHoveredFieldMetadataItemIdComponentState';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';

const StyledFieldContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  max-width: ${RECORD_LIST_ROW_FIELD_MAX_WIDTH}px;
  overflow: hidden;

  & > * {
    pointer-events: none;
  }
`;

type RecordListRowFieldProps = {
  recordId: string;
  recordField: RecordField;
};

export const RecordListRowField = ({
  recordId,
  recordField,
}: RecordListRowFieldProps) => {
  const { fieldDefinitionByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const setRecordListHoveredFieldMetadataItemId = useSetAtomComponentState(
    recordListHoveredFieldMetadataItemIdComponentState,
  );

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

  return (
    <StyledFieldContainer
      className={RECORD_LIST_ROW_FIELD_ANCHOR_CLASS_NAME}
      onMouseEnter={() =>
        setRecordListHoveredFieldMetadataItemId(recordField.fieldMetadataItemId)
      }
    >
      <FieldContext.Provider
        value={{
          recordId,
          maxWidth: RECORD_LIST_ROW_FIELD_MAX_WIDTH,
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
              prefix: RECORD_LIST_ROW_INPUT_ID_PREFIX,
            }),
          }}
        >
          <FieldDisplay />
        </RecordFieldComponentInstanceContext.Provider>
      </FieldContext.Provider>
    </StyledFieldContainer>
  );
};

import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RECORD_LIST_ROW_FIELD_ANCHOR_CLASS_NAME } from '@/object-record/record-list/constants/RecordListRowFieldAnchorClassName';
import { RECORD_LIST_ROW_INPUT_ID_PREFIX } from '@/object-record/record-list/constants/RecordListRowInputIdPrefix';
import { recordListHoveredFieldMetadataItemIdComponentState } from '@/object-record/record-list/states/recordListHoveredFieldMetadataItemIdComponentState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';

// Shrinkable rather than fixed: a long record label can eat into the fields'
// share of the row, and a field that refuses to give any of it back is clipped
// off the left edge of the right-aligned group instead of narrowing.
const StyledFieldContainer = styled.div`
  align-items: center;
  display: flex;
  min-width: 0;
  overflow: hidden;

  & > * {
    pointer-events: none;
  }
`;

type RecordListRowFieldProps = {
  recordId: string;
  recordField: RecordField;
  fieldDefinition: ColumnDefinition<FieldMetadata>;
  maxWidth: number;
};

export const RecordListRowField = ({
  recordId,
  recordField,
  fieldDefinition,
  maxWidth,
}: RecordListRowFieldProps) => {
  const setRecordListHoveredFieldMetadataItemId = useSetAtomComponentState(
    recordListHoveredFieldMetadataItemIdComponentState,
  );

  return (
    <StyledFieldContainer
      className={RECORD_LIST_ROW_FIELD_ANCHOR_CLASS_NAME}
      style={{ maxWidth }}
      onMouseEnter={() =>
        setRecordListHoveredFieldMetadataItemId(recordField.fieldMetadataItemId)
      }
    >
      <FieldContext.Provider
        value={{
          recordId,
          maxWidth,
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

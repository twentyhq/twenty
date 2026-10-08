import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RECORD_LIST_ROW_INPUT_ID_PREFIX } from '@/object-record/record-list/constants/RecordListRowInputIdPrefix';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

// Shrinkable so a long record label narrows fields instead of clipping them off the left edge.
const StyledFieldContainer = styled.div<{ isOnDemand: boolean }>`
  align-items: center;
  display: flex;
  min-width: 0;
  overflow: hidden;

  & > * {
    pointer-events: ${({ isOnDemand }) => (isOnDemand ? 'auto' : 'none')};
  }
`;

type RecordListRowFieldProps = {
  recordId: string;
  recordField: RecordField;
  fieldDefinition: ColumnDefinition<FieldMetadata>;
  maxWidth: number;
  isOnDemand?: boolean;
};

export const RecordListRowField = ({
  recordId,
  recordField,
  fieldDefinition,
  maxWidth,
  isOnDemand = false,
}: RecordListRowFieldProps) => {
  return (
    <Tooltip.Trigger
      payload={recordField.fieldMetadataItemId}
      delay={TooltipDelay.shortDelay}
      render={
        <StyledFieldContainer isOnDemand={isOnDemand} style={{ maxWidth }} />
      }
    >
      <FieldContext.Provider
        value={{
          recordId,
          maxWidth,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: true,
          isOnDemand,
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
    </Tooltip.Trigger>
  );
};

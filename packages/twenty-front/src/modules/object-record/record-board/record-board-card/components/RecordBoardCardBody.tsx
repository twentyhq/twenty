import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { StopPropagationContainer } from '@/object-record/record-board/utils/StopPropagationContainer';
import { useContext } from 'react';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardBodyContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardBodyContainer';

export const RecordBoardCardBody = ({
  fieldDefinitions,
  recordId,
}: {
  fieldDefinitions: RecordBoardFieldDefinition<FieldMetadata>[];
  recordId?: string;
}) => {
  const { updateOneRecord } = useContext(RecordBoardContext);

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };
  return (
    <RecordBoardCardBodyContainer>
      {fieldDefinitions.map((fieldDefinition) => (
        <StopPropagationContainer key={fieldDefinition.fieldMetadataId}>
          <FieldContext.Provider
            value={{
              recordId: recordId || '',
              maxWidth: 156,
              recoilScopeId:
                (recordId || 'new') + fieldDefinition.fieldMetadataId,
              isLabelIdentifier: false,
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
              hotkeyScope: InlineCellHotkeyScope.InlineCell,
            }}
          >
            <RecordInlineCell />
          </FieldContext.Provider>
        </StopPropagationContainer>
      ))}
    </RecordBoardCardBodyContainer>
  );
};

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardBodyContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardBodyContainer';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useContext } from 'react';

export const RecordBoardCardBody = ({
  fieldDefinitions,
}: {
  fieldDefinitions: RecordBoardFieldDefinition<FieldMetadata>[];
}) => {
  const { recordId } = useContext(RecordBoardCardContext);

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
              recordId,
              maxWidth: 156,
              recoilScopeId: `board-card-${recordId}-${fieldDefinition.fieldMetadataId}`,
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
            <RecordFieldComponentInstanceContext.Provider
              value={{
                instanceId: `board-card-${recordId}-${fieldDefinition.fieldMetadataId}`,
              }}
            >
              <RecordInlineCell />
            </RecordFieldComponentInstanceContext.Provider>
          </FieldContext.Provider>
        </StopPropagationContainer>
      ))}
    </RecordBoardCardBodyContainer>
  );
};

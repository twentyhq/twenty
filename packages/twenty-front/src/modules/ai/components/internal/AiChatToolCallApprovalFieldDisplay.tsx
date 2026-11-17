import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

type AiChatToolCallApprovalFieldDisplayProps = {
  objectNameSingular: string;
  recordId: string;
  fieldDefinition: FieldDefinition<FieldMetadata>;
};

export const AiChatToolCallApprovalFieldDisplay = ({
  objectNameSingular,
  recordId,
  fieldDefinition,
}: AiChatToolCallApprovalFieldDisplayProps) => {
  const { fieldName } = fieldDefinition.metadata;

  return (
    <FieldContextProvider
      objectNameSingular={objectNameSingular}
      objectRecordId={recordId}
      fieldMetadataName={fieldName}
      fieldPosition={0}
      showLabel={false}
    >
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: `ai-chat-tool-call-approval-${recordId}-${fieldName}`,
        }}
      >
        <FieldDisplay />
      </RecordFieldComponentInstanceContext.Provider>
    </FieldContextProvider>
  );
};

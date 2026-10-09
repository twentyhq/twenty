import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';

type UseOpenRecordCardFieldEditModeProps = {
  recordId: string;
  prefix: string;
  setEditModePosition: (position: number) => void;
};

export const useOpenRecordCardFieldEditMode = ({
  recordId,
  prefix,
  setEditModePosition,
}: UseOpenRecordCardFieldEditModeProps) => {
  const initDraftValue = useInitDraftValue();
  const { openFieldInput } = useOpenFieldInputEditMode();

  const openRecordCardFieldEditMode = ({
    fieldDefinition,
    position,
  }: {
    fieldDefinition: FieldDefinition<FieldMetadata>;
    position: number;
  }) => {
    initDraftValue({
      recordId,
      fieldDefinition,
      fieldComponentInstanceId: getRecordFieldInputInstanceId({
        recordId,
        fieldName: fieldDefinition.metadata.fieldName,
        prefix,
      }),
    });
    setEditModePosition(position);
    openFieldInput({ fieldDefinition, recordId, prefix });
  };

  return { openRecordCardFieldEditMode };
};

import { useContext } from 'react';

import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { FieldContext } from '../../contexts/FieldContext';

export const useActorFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { currentWorkspaceMembersWithDeleted } = useContext(AuthContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldActorValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition,
    fieldValue: {
      ...fieldValue,
      workspaceMember: currentWorkspaceMembersWithDeleted?.find(
        (member) => member.id === fieldValue?.workspaceMemberId,
      ),
    },
  };
};

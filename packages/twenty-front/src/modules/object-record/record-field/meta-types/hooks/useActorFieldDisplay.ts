import { useContext } from 'react';

import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { isDefined } from 'twenty-shared/utils';
import { FieldContext } from '../../contexts/FieldContext';

export type ActorFieldDisplayValue = {
  fieldValue: FieldActorValue | undefined;
  name: string;
  avatarUrl: string;
};

export const useActorFieldDisplay = (): ActorFieldDisplayValue => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { currentWorkspaceMembersWithDeleted } = useContext(AuthContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldActorValue | undefined>(
    recordId,
    fieldName,
  );

  if (!isDefined(fieldValue)) {
    return {
      fieldValue: undefined,
      name: '',
      avatarUrl: '',
    };
  }

  let name = fieldValue.name;

  if (!isDefined(name) || name.trim() === '') {
    const fullname = currentWorkspaceMembersWithDeleted?.find(
      (member) => member.id === fieldValue?.workspaceMemberId,
    )?.name;

    name = (fullname?.firstName + ' ' + fullname?.lastName).trim();
  }

  const avatarUrl =
    currentWorkspaceMembersWithDeleted?.find(
      (member) => member.id === fieldValue?.workspaceMemberId,
    )?.avatarUrl ?? '';

  return {
    fieldValue,
    name,
    avatarUrl: avatarUrl,
  };
};

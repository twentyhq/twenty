import { useContext } from 'react';

import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceMember } from '~/generated-metadata/graphql';
import { FieldContext } from '../../contexts/FieldContext';

export type ActorFieldDisplayValue = {
  fieldValue: FieldActorValue;
  name: string;
} & Pick<WorkspaceMember, 'avatarUrl'>;

export const useActorFieldDisplay = (): ActorFieldDisplayValue | undefined => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { currentWorkspaceDeletedMembers, currentWorkspaceMembers } =
    useContext(AuthContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldActorValue | undefined>(
    recordId,
    fieldName,
  );
  if (!isDefined(fieldValue)) {
    return undefined;
  }

  const relatedWorkspaceMember = [
    ...(currentWorkspaceDeletedMembers ?? []),
    ...(currentWorkspaceMembers ?? []),
  ].find(
    (workspaceMember) => workspaceMember.id === fieldValue.workspaceMemberId,
  );
  if (!isDefined(relatedWorkspaceMember)) {
    return {
      fieldValue,
      name: fieldValue.name,
    };
  }

  const { name, avatarUrl } = relatedWorkspaceMember;
  return {
    fieldValue,
    name: `${name.firstName} ${name.lastName}`,
    avatarUrl: avatarUrl,
  };
};

import { useContext } from 'react';

import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceMember } from '~/generated-metadata/graphql';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

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
    fieldDefinition,
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

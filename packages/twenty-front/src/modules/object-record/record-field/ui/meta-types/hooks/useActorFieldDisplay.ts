import { useContext } from 'react';

import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { AuthContext } from '@/auth/contexts/AuthContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceMember } from '~/generated-metadata/graphql';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { resolveActorFieldDisplay } from '@/object-record/record-field/ui/utils/resolveActorFieldDisplay';

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

  return {
    fieldValue,
    ...resolveActorFieldDisplay({
      fieldValue,
      workspaceMembers: [
        ...(currentWorkspaceDeletedMembers ?? []),
        ...(currentWorkspaceMembers ?? []),
      ],
    }),
  };
};

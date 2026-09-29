import { isDefined } from 'twenty-shared/utils';

import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type WorkspaceMember } from '~/generated-metadata/graphql';

export const resolveActorFieldDisplay = ({
  fieldValue,
  workspaceMembers,
}: {
  fieldValue: FieldActorValue;
  workspaceMembers: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'>[];
}): { name: string } & Partial<Pick<WorkspaceMember, 'avatarUrl'>> => {
  const relatedWorkspaceMember = workspaceMembers.find(
    (workspaceMember) => workspaceMember.id === fieldValue.workspaceMemberId,
  );

  if (!isDefined(relatedWorkspaceMember)) {
    return { name: fieldValue.name };
  }

  const { name, avatarUrl } = relatedWorkspaceMember;

  return {
    name: `${name.firstName} ${name.lastName}`,
    avatarUrl,
  };
};

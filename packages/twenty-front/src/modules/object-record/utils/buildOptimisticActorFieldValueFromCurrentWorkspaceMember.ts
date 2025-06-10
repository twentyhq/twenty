import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

export const buildOptimisticActorFieldValueFromCurrentWorkspaceMember = (
  currentWorkspaceMember: CurrentWorkspaceMember | null,
): FieldActorValue => {
  const defaultActorFieldValue: FieldActorValue = {
    context: {},
    name: '',
    source: 'MANUAL',
    workspaceMemberId: null,
  };

  if (!isDefined(currentWorkspaceMember)) {
    return defaultActorFieldValue;
  }

  const {
    id: workspaceMemberId,
    name: { firstName, lastName },
  } = currentWorkspaceMember;
  const name = `${firstName} ${lastName}`;
  return {
    ...defaultActorFieldValue,
    name: name,
    workspaceMemberId,
  };
};

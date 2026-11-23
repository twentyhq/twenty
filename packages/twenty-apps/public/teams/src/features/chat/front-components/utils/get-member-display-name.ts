import { isNonEmptyString } from '@sniptt/guards';

import { type WorkspaceMemberOption } from 'src/features/chat/front-components/types/workspace-member-option.type';

export const getMemberDisplayName = (
  member: Pick<WorkspaceMemberOption, 'name' | 'userEmail' | 'id'>,
): string => {
  if (isNonEmptyString(member.name)) {
    return member.name;
  }

  if (isNonEmptyString(member.userEmail)) {
    return member.userEmail;
  }

  return member.id;
};

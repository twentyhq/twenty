import { isNonEmptyString } from '@sniptt/guards';

import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';

export const getMemberDisplayName = (member: WorkspaceMemberOption): string => {
  if (isNonEmptyString(member.name)) {
    return member.name;
  }

  if (isNonEmptyString(member.userEmail)) {
    return member.userEmail;
  }

  return member.id;
};

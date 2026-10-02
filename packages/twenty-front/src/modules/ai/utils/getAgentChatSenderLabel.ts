import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAgentChatSenderLabel = ({
  sender,
  isCurrentWorkspaceMember,
}: {
  sender: Pick<PartialWorkspaceMember, 'name' | 'userEmail'> | undefined;
  isCurrentWorkspaceMember: boolean;
}) => {
  if (isCurrentWorkspaceMember) {
    return t`You`;
  }

  if (!isDefined(sender)) {
    return t`Former member`;
  }

  const fullName = `${sender.name.firstName} ${sender.name.lastName}`.trim();

  return isNonEmptyString(fullName) ? fullName : sender.userEmail;
};

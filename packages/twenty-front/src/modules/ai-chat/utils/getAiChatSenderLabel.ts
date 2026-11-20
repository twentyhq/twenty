import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';

import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getAiChatSenderLabel = ({
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

  return getWorkspaceMemberNameOrEmail(sender);
};

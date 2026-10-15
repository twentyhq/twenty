import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

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

  return getWorkspaceMemberNameOrEmail(sender);
};

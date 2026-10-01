import { isDefined } from 'twenty-shared/utils';

import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

// The owner is known before the preview loads, so it leads and the row keeps
// its first avatar when the other members arrive
export const getAgentChatThreadMembers = <
  TWorkspaceMember extends Pick<PartialWorkspaceMember, 'id'>,
>({
  ownerWorkspaceMemberId,
  memberIds,
  workspaceMembers,
}: {
  ownerWorkspaceMemberId: string | null | undefined;
  memberIds: string[];
  workspaceMembers: TWorkspaceMember[];
}): TWorkspaceMember[] =>
  [...new Set([ownerWorkspaceMemberId, ...memberIds])]
    .map((memberId) => workspaceMembers.find(({ id }) => id === memberId))
    .filter(isDefined);

import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SidePanelAiChatParticipantsMemberAvatarProps = {
  workspaceMember: PartialWorkspaceMember;
};

export const SidePanelAiChatParticipantsMemberAvatar = ({
  workspaceMember,
}: SidePanelAiChatParticipantsMemberAvatarProps) => (
  <Avatar
    src={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
    colorSeed={workspaceMember.id}
    name={getWorkspaceMemberNameOrEmail(workspaceMember)}
    shape="circle"
  />
);

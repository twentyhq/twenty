import { styled } from '@linaria/react';
import { Avatar, AvatarGroup } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const DEFAULT_MAX_VISIBLE_MEMBER_AVATARS = 5;
const WORKSPACE_MEMBER_AVATAR_CHIP_SIZE = '18px';

type WorkspaceMemberAvatarStackMember = {
  avatarUrl?: string | null;
  id: string;
  name?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  userEmail?: string | null;
};

type WorkspaceMemberAvatarStackProps = {
  defaultAvatarName: string;
  maxVisible?: number;
  totalWorkspaceMembersCount?: number | null;
  workspaceMembers: WorkspaceMemberAvatarStackMember[];
};

const StyledAvatarStackContainer = styled.div`
  align-items: center;
  display: flex;
  min-width: 0;
`;

const StyledAvatarContainer = styled.div`
  border: 1px solid ${themeCssVariables.background.secondary};
  border-radius: 50%;
  corner-shape: round;
  display: flex;
`;

const StyledMoreAvatar = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: 12px;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${WORKSPACE_MEMBER_AVATAR_CHIP_SIZE};
  justify-content: center;
  min-width: ${WORKSPACE_MEMBER_AVATAR_CHIP_SIZE};
  padding: 0 ${themeCssVariables.spacing[1]};
  width: fit-content;
`;

const getWorkspaceMemberDisplayName = (
  workspaceMember: WorkspaceMemberAvatarStackMember,
  defaultAvatarName: string,
) => {
  const fullName = [
    workspaceMember.name?.firstName,
    workspaceMember.name?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || workspaceMember.userEmail || defaultAvatarName;
};

export const WorkspaceMemberAvatarStack = ({
  defaultAvatarName,
  maxVisible = DEFAULT_MAX_VISIBLE_MEMBER_AVATARS,
  totalWorkspaceMembersCount,
  workspaceMembers,
}: WorkspaceMemberAvatarStackProps) => {
  const visibleWorkspaceMembers = workspaceMembers.slice(0, maxVisible);
  const visibleWorkspaceMembersCount = visibleWorkspaceMembers.length;
  const hiddenWorkspaceMembersCount = Math.max(
    0,
    (totalWorkspaceMembersCount ?? workspaceMembers.length) -
      visibleWorkspaceMembersCount,
  );

  if (visibleWorkspaceMembersCount === 0 && hiddenWorkspaceMembersCount === 0) {
    return null;
  }

  return (
    <StyledAvatarStackContainer>
      <AvatarGroup
        avatars={visibleWorkspaceMembers.map((workspaceMember) => {
          const displayName = getWorkspaceMemberDisplayName(
            workspaceMember,
            defaultAvatarName,
          );

          return (
            <StyledAvatarContainer key={workspaceMember.id}>
              <Avatar
                avatarUrl={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
                placeholder={displayName}
                placeholderColorSeed={workspaceMember.id}
                size="md"
                type="rounded"
              />
            </StyledAvatarContainer>
          );
        })}
        maxVisible={maxVisible}
        overflowAvatar={
          hiddenWorkspaceMembersCount > 0 ? (
            <StyledMoreAvatar>+{hiddenWorkspaceMembersCount}</StyledMoreAvatar>
          ) : undefined
        }
        overlap="left"
        overlapOffset="4px"
      />
    </StyledAvatarStackContainer>
  );
};

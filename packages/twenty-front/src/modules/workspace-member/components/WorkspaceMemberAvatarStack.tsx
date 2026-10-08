import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarGroup } from 'twenty-ui/components/data-display';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const DEFAULT_MAX_VISIBLE_MEMBER_AVATARS = 5;

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

const getWorkspaceMemberDisplayName = ({
  workspaceMember,
  defaultAvatarName,
}: {
  workspaceMember: WorkspaceMemberAvatarStackMember;
  defaultAvatarName: string;
}) => {
  const fullName = [
    workspaceMember.name?.firstName,
    workspaceMember.name?.lastName,
  ]
    .filter(isNonEmptyString)
    .join(' ')
    .trim();

  if (isNonEmptyString(fullName)) {
    return fullName;
  }

  return isNonEmptyString(workspaceMember.userEmail)
    ? workspaceMember.userEmail
    : defaultAvatarName;
};

export const WorkspaceMemberAvatarStack = ({
  defaultAvatarName,
  maxVisible = DEFAULT_MAX_VISIBLE_MEMBER_AVATARS,
  totalWorkspaceMembersCount,
  workspaceMembers,
}: WorkspaceMemberAvatarStackProps) => {
  return (
    <AvatarGroup
      render={<StyledAvatarStackContainer />}
      avatars={workspaceMembers.map((workspaceMember) => {
        const displayName = getWorkspaceMemberDisplayName({
          workspaceMember,
          defaultAvatarName,
        });

        return (
          <StyledAvatarContainer key={workspaceMember.id}>
            <Avatar
              src={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
              name={displayName}
              imageProps={{ alt: displayName }}
              colorSeed={workspaceMember.id}
              size="md"
              shape="circle"
            />
          </StyledAvatarContainer>
        );
      })}
      maxVisible={maxVisible}
      total={totalWorkspaceMembersCount ?? undefined}
      overflowShape="circle"
      overlap="left"
      overlapOffset="4px"
    />
  );
};

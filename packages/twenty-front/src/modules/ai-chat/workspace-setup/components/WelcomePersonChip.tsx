import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledChip = styled.div`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
`;

const StyledPersonName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  max-width: min(calc(40vw / var(--t-zoom, 1)), 360px);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 600px) {
    max-width: min(calc(70vw / var(--t-zoom, 1)), 360px);
  }
`;

export const WelcomePersonChip = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const firstName = currentWorkspaceMember?.name?.firstName ?? '';
  const lastName = currentWorkspaceMember?.name?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <StyledChip>
      <Avatar
        shape="circle"
        size="xs"
        name={fullName}
        colorSeed={currentWorkspaceMember?.id}
        src={getAbsoluteImageUrl(currentWorkspaceMember?.avatarUrl)}
      />
      <StyledPersonName>{fullName}</StyledPersonName>
    </StyledChip>
  );
};

import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledChip = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledPersonName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  max-width: min(40vw, 360px);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const WelcomePersonChip = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const firstName = currentWorkspaceMember?.name?.firstName ?? '';
  const lastName = currentWorkspaceMember?.name?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <StyledChip>
      <Avatar
        type="rounded"
        size="lg"
        placeholder={fullName}
        placeholderColorSeed={currentWorkspaceMember?.id}
        avatarUrl={getAbsoluteImageUrl(currentWorkspaceMember?.avatarUrl)}
      />
      <StyledPersonName>{fullName}</StyledPersonName>
    </StyledChip>
  );
};

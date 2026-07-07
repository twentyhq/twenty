import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
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

const StyledWorkspaceName = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

export const WelcomeWorkspaceChip = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const displayName = currentWorkspace?.displayName ?? '';

  return (
    <StyledChip>
      <Avatar
        type="rounded"
        size="lg"
        placeholder={displayName}
        placeholderColorSeed={currentWorkspace?.id}
        avatarUrl={getAbsoluteImageUrl(
          currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
        )}
      />
      <StyledWorkspaceName>{displayName}</StyledWorkspaceName>
    </StyledChip>
  );
};

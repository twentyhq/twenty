import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconMessageCirclePlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { useStartNewExpandedAiChat } from '@/ai/expanded-chat/hooks/useStartNewExpandedAiChat';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div<{ isMobile: boolean }>`
  flex-shrink: 0;
  margin-top: auto;
  padding-left: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
  padding-right: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
`;

// Starting a conversation is transversal: this sits at the bottom of the
// drawer on every screen, in every mode.
export const NewAiChatDrawerButton = () => {
  const isMobile = useIsMobile();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { startNewExpandedAiChat } = useStartNewExpandedAiChat();

  if (!hasAiPermission) {
    return null;
  }

  return (
    <StyledContainer isMobile={isMobile}>
      <NavigationDrawerItem
        label={t`New chat`}
        Icon={IconMessageCirclePlus}
        onClick={startNewExpandedAiChat}
      />
    </StyledContainer>
  );
};

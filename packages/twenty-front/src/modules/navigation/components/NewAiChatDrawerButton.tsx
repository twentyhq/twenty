import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconMessageCirclePlus } from 'twenty-ui/icon';

import { useStartNewExpandedAiChat } from '@/ai/expanded-chat/hooks/useStartNewExpandedAiChat';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  flex-shrink: 0;
  margin-top: auto;
`;

// Starting a conversation is transversal: this sits at the bottom of the
// drawer on every screen, in every mode.
export const NewAiChatDrawerButton = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { startNewExpandedAiChat } = useStartNewExpandedAiChat();

  if (!hasAiPermission) {
    return null;
  }

  return (
    <StyledContainer>
      <NavigationDrawerItem
        label={t`New chat`}
        Icon={IconMessageCirclePlus}
        onClick={startNewExpandedAiChat}
      />
    </StyledContainer>
  );
};

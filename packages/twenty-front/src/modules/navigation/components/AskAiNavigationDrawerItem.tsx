import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/icon';

import { useOpenExpandedAiChat } from '@/ai/expanded-chat/hooks/useOpenExpandedAiChat';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const AskAiNavigationDrawerItem = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { openExpandedAiChat, isOnExpandedAiChatPage } =
    useOpenExpandedAiChat();

  if (!hasAiPermission) {
    return null;
  }

  return (
    <NavigationDrawerItem
      label={t`Ask AI`}
      Icon={IconSparkles}
      active={isOnExpandedAiChatPage}
      onClick={openExpandedAiChat}
    />
  );
};

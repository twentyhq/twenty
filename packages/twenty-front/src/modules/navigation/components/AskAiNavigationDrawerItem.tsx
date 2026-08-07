import { t } from '@lingui/core/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/icon';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const AskAiNavigationDrawerItem = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const navigate = useNavigate();
  const location = useLocation();
  const setAiChatExpandedReturnLocation = useSetAtomState(
    aiChatExpandedReturnLocationState,
  );

  const isOnExpandedAiChatPage = location.pathname === AppPath.AiChat;

  if (!hasAiPermission) {
    return null;
  }

  const handleClick = () => {
    if (isOnExpandedAiChatPage) {
      return;
    }

    setAiChatExpandedReturnLocation(
      `${location.pathname}${location.search}${location.hash}`,
    );
    navigate(AppPath.AiChat);
  };

  return (
    <NavigationDrawerItem
      label={t`Ask AI`}
      Icon={IconSparkles}
      active={isOnExpandedAiChatPage}
      onClick={handleClick}
    />
  );
};

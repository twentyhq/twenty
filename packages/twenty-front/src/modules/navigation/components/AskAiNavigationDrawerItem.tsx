import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/icon';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const AskAiNavigationDrawerItem = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  if (!hasAiPermission) {
    return null;
  }

  return (
    <NavigationDrawerItem
      label={t`Ask AI`}
      Icon={IconSparkles}
      onClick={() => openAskAiPage({ resetNavigationStack: true })}
    />
  );
};

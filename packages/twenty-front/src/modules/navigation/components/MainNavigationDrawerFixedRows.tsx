import { useLingui } from '@lingui/react/macro';
import { IconMessageCirclePlus, IconSearch } from 'twenty-ui/icon';

import { useSwitchToNewAiChatInInboxChannel } from '@/inbox/hooks/useSwitchToNewAiChatInInboxChannel';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const MainNavigationDrawerFixedRows = () => {
  const { t } = useLingui();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const { switchToNewChat } = useSwitchToNewAiChatInInboxChannel();

  if (!isCustomizableSidebarEnabled) {
    return null;
  }

  return (
    <>
      <NavigationDrawerItem
        label={t`Search`}
        Icon={IconSearch}
        onClick={openRecordsSearchPage}
        triggerEvent="CLICK"
      />
      {hasAiPermission && (
        <NavigationDrawerItem
          label={t`New AI chat`}
          Icon={IconMessageCirclePlus}
          onClick={switchToNewChat}
          triggerEvent="CLICK"
        />
      )}
    </>
  );
};

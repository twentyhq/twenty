import { useLingui } from '@lingui/react/macro';
import { IconMessageCirclePlus, IconSearch } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const MainNavigationDrawerFixedRows = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const { switchToNewChat } = useSwitchToNewAiChat();

  if (!isCustomizableSidebarEnabled || isMobile) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerItem
        label={t`Search`}
        Icon={IconSearch}
        onClick={openRecordsSearchPage}
      />
      {hasAiPermission && (
        <NavigationDrawerItem
          label={t`New AI chat`}
          Icon={IconMessageCirclePlus}
          onClick={() => switchToNewChat()}
        />
      )}
    </NavigationDrawerSection>
  );
};

import { useLingui } from '@lingui/react/macro';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { IconPlus } from 'twenty-ui/icon';

import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';

type NavigationMenuAddSectionButtonProps = {
  containerId: string | null;
};

export const NavigationMenuAddSectionButton = ({
  containerId,
}: NavigationMenuAddSectionButtonProps) => {
  const { t } = useLingui();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { createSection } = useCreateNavigationMenuTabOrSection();

  if (!isCustomizableSidebarEnabled) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationMenuItemEntrance>
        <NavigationDrawerItem
          Icon={IconPlus}
          label={t`Add section`}
          triggerEvent="CLICK"
          variant="tertiary"
          onClick={() => createSection(containerId)}
        />
      </NavigationMenuItemEntrance>
    </NavigationDrawerSection>
  );
};

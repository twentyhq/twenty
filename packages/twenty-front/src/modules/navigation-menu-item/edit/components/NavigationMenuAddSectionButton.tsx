import { useLingui } from '@lingui/react/macro';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { IconPlus } from 'twenty-ui/icon';

import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

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
  const { createItem } = useNavigationMenuItemEditController('workspace');
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );

  const handleClick = () => {
    const sectionId = createItem(
      { type: NavigationMenuItemType.SECTION, name: t`New section` },
      { targetFolderId: containerId },
    );
    setNavigationMenuItemIdToRename(sectionId);
  };

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
          onClick={handleClick}
        />
      </NavigationMenuItemEntrance>
    </NavigationDrawerSection>
  );
};

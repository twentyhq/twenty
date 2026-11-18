import { useLingui } from '@lingui/react/macro';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { IconPlus } from 'twenty-ui/icon';

import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { MainNavigationDrawerTab } from '@/navigation/components/MainNavigationDrawerTab';

type MainNavigationDrawerAddTabButtonProps = {
  isExpanded: boolean;
  shouldShowTooltip: boolean;
};

export const MainNavigationDrawerAddTabButton = ({
  isExpanded,
  shouldShowTooltip,
}: MainNavigationDrawerAddTabButtonProps) => {
  const { t } = useLingui();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { createItem } = useNavigationMenuItemEditController('workspace');
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );

  const handleClick = () => {
    const tabId = createItem({
      type: NavigationMenuItemType.TAB,
      name: t`New tab`,
      icon: NAVIGATION_MENU_TAB_ICON_DEFAULT,
    });
    setCurrentNavigationMenuTabId(tabId);
    setNavigationMenuItemIdToRename(tabId);
  };

  if (!isCustomizableSidebarEnabled) {
    return null;
  }

  return (
    <MainNavigationDrawerTab
      Icon={IconPlus}
      label={t`Add tab`}
      isActive={false}
      isExpanded={isExpanded}
      isDisabled={false}
      tooltip={t`Add tab`}
      shouldShowTooltip={shouldShowTooltip}
      onClick={handleClick}
    />
  );
};

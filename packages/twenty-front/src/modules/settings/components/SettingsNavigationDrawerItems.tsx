import { useRecoilValue } from 'recoil';
import { IconDoorEnter } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsNavigationDrawerItem } from '@/settings/components/SettingsNavigationDrawerItem';
import {
  SettingsNavigationItem,
  settingsNavItems,
} from '@/settings/constants/settingsNavItems';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useLingui } from '@lingui/react/macro';

export const SettingsNavigationDrawerItems = () => {
  const { signOut } = useAuth();
  const { t } = useLingui();

  const billing = useRecoilValue(billingState);

  const isFunctionSettingsEnabled = false;
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const currentUser = useRecoilValue(currentUserState);
  const isAdminEnabled = currentUser?.canImpersonate ?? false;
  const labPublicFeatureFlags = useRecoilValue(labPublicFeatureFlagsState);

  const featureFlags = useFeatureFlagsMap();
  const permissionMap = useSettingsPermissionMap();

  const visibilityParams = {
    isBillingEnabled,
    isFunctionSettingsEnabled,
    isAdminEnabled,
    featureFlags,
    permissionMap,
    hasLabFeatureFlags: labPublicFeatureFlags?.length > 0,
  };

  const renderNavigationItem = (
    item: SettingsNavigationItem,
    index: number,
    totalItems: number,
  ) => {
    if (item.isHidden?.(visibilityParams) === true) {
      return null;
    }

    const navigationItem = (
      <SettingsNavigationDrawerItem
        key={item.path}
        label={item.label}
        path={item.path}
        Icon={item.Icon}
        indentationLevel={item.indentationLevel}
        matchSubPages={item.matchSubPages}
        subItemState={
          item.indentationLevel
            ? getNavigationSubItemLeftAdornment({
                arrayLength: totalItems,
                index,
                selectedIndex: index,
              })
            : undefined
        }
      />
    );

    return item.isAdvanced ? (
      <AdvancedSettingsWrapper key={item.path} navigationDrawerItem>
        {navigationItem}
      </AdvancedSettingsWrapper>
    ) : (
      navigationItem
    );
  };

  return (
    <>
      {settingsNavItems.map((section) => {
        const allItemsHidden = section.items.every(
          (item) => item.isHidden?.(visibilityParams) === true,
        );
        if (allItemsHidden) {
          return null;
        }

        return (
          <NavigationDrawerSection key={section.label}>
            {section.isAdvanced ? (
              <AdvancedSettingsWrapper hideIcon>
                <NavigationDrawerSectionTitle label={section.label} />
              </AdvancedSettingsWrapper>
            ) : (
              <NavigationDrawerSectionTitle label={section.label} />
            )}
            {section.items.map((item, index) => {
              const subItems = item.subItems;
              if (Array.isArray(subItems) && subItems.length > 0) {
                return (
                  <NavigationDrawerItemGroup key={item.path}>
                    {renderNavigationItem(item, index, section.items.length)}
                    {subItems.map((subItem, subIndex) =>
                      renderNavigationItem(subItem, subIndex, subItems.length),
                    )}
                  </NavigationDrawerItemGroup>
                );
              }
              return renderNavigationItem(item, index, section.items.length);
            })}
          </NavigationDrawerSection>
        );
      })}
      <NavigationDrawerSection>
        <NavigationDrawerItem
          label={t`Logout`}
          onClick={signOut}
          Icon={IconDoorEnter}
        />
      </NavigationDrawerSection>
    </>
  );
};

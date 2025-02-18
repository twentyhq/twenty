import { IconDoorEnter } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsNavigationDrawerItem } from '@/settings/components/SettingsNavigationDrawerItem';
import {
  SettingsNavigationItem,
  SettingsNavigationSection,
  useSettingsNavigationItems,
} from '@/settings/hooks/useSettingsNavigationItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useLingui } from '@lingui/react/macro';

export const SettingsNavigationDrawerItems = () => {
  const { signOut } = useAuth();
  const { t } = useLingui();

  const settingsNavigationItems: SettingsNavigationSection[] =
    useSettingsNavigationItems();

  const renderNavigationItem = (
    item: SettingsNavigationItem,
    index: number,
    totalItems: number,
  ) => (
    <SettingsNavigationDrawerItem
      key={item.path}
      Icon={item.Icon}
      label={item.label}
      path={item.path}
      indentationLevel={item.indentationLevel}
      matchSubPages={item.matchSubPages}
      isAdvanced={item.isAdvanced}
      isHidden={item.isHidden}
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

  return (
    <>
      {settingsNavigationItems.map((section) => {
        const allItemsHidden = section.items.every((item) => item.isHidden);
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

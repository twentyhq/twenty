import { useAuth } from '@/auth/hooks/useAuth';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconDoorEnter, IconSettings } from 'twenty-ui/display';

export const ShahryarOtherSection = () => {
  const { signOut } = useAuth();

  return (
    <NavigationDrawerSection>
      <NavigationDrawerSectionTitle label="ڕێکخستنەکان" />
      <NavigationDrawerItem
        label="ڕێکخستنەکان"
        Icon={IconSettings}
        to={getSettingsPath(SettingsPath.ProfilePage)}
      />
      <NavigationDrawerItem
        label="چوونەدەرەوە"
        Icon={IconDoorEnter}
        onClick={signOut}
      />
    </NavigationDrawerSection>
  );
};

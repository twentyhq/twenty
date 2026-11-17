import { useLingui } from '@lingui/react/macro';
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
  const { createSection } = useCreateNavigationMenuTabOrSection();

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

import { useLingui } from '@lingui/react/macro';
import { IconNewSection } from 'twenty-ui/icon';

import { NavigationMenuItemContainerTemplateMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerTemplateMenu';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';

type NavigationMenuItemAddSectionButtonProps = {
  parentId: string | null;
};

export const NavigationMenuItemAddSectionButton = ({
  parentId,
}: NavigationMenuItemAddSectionButtonProps) => {
  const { t } = useLingui();
  const { createSection } = useCreateNavigationMenuTabOrSection();

  return (
    <NavigationDrawerSection>
      <NavigationMenuItemEntrance>
        <NavigationMenuItemContainerTemplateMenu
          dropdownId={`navigation-menu-add-section-${parentId ?? 'home'}`}
          title={t`Add section`}
          blankLabel={t`Blank section`}
          isTriggerNativeButton={false}
          trigger={
            <div tabIndex={-1}>
              <NavigationDrawerItem
                Icon={IconNewSection}
                label={t`Add section`}
                triggerEvent="CLICK"
                variant="tertiary"
              />
            </div>
          }
          onSelect={(template) => createSection({ parentId, template })}
        />
      </NavigationMenuItemEntrance>
    </NavigationDrawerSection>
  );
};

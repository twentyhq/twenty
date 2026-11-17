import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { NavigationMenuSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuSectionMenu';

type NavigationMenuEditableBuiltInSectionProps = {
  section: Pick<
    NamedNavigationMenuItem,
    'id' | 'name' | 'icon' | 'parentId' | 'type'
  >;
};

export const NavigationMenuEditableBuiltInSection = ({
  section,
}: NavigationMenuEditableBuiltInSectionProps) => (
  <NavigationMenuItemSection
    title={section.name}
    isOpen={false}
    onToggle={() => undefined}
    rightIcon={<NavigationMenuSectionMenu section={section} />}
    alwaysShowRightIcon
  >
    {null}
  </NavigationMenuItemSection>
);

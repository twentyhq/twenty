import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';

type NavigationMenuItemEditableSectionPlaceholderProps = {
  section: NavigationMenuItem;
  defaultName: string;
};

export const NavigationMenuItemEditableSectionPlaceholder = ({
  section,
  defaultName,
}: NavigationMenuItemEditableSectionPlaceholderProps) => (
  <CollapsibleNavigationDrawerSection
    sectionId={getNavigationMenuSectionNavigationSectionId(section)}
    label={section.name ?? defaultName}
    rightIcon={
      <NavigationMenuItemSectionMenu
        section={section}
        defaultName={defaultName}
      />
    }
    alwaysShowRightIcon
  >
    {null}
  </CollapsibleNavigationDrawerSection>
);

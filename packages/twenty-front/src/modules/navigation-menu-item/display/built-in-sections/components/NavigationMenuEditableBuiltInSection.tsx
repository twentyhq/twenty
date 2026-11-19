import { useLingui } from '@lingui/react/macro';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { NavigationMenuSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuSectionMenu';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuEditableBuiltInSectionProps = {
  section: Pick<
    NavigationMenuItem,
    'id' | 'name' | 'icon' | 'parentId' | 'type' | 'builtInSectionKey'
  >;
};

export const NavigationMenuEditableBuiltInSection = ({
  section,
}: NavigationMenuEditableBuiltInSectionProps) => {
  const { t } = useLingui();
  const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
    ({ key }) => key === section.builtInSectionKey,
  );

  if (builtInSection === undefined) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerSectionTitle
        label={t(builtInSection.label)}
        rightIcon={<NavigationMenuSectionMenu section={section} />}
        alwaysShowRightIcon
      />
    </NavigationDrawerSection>
  );
};

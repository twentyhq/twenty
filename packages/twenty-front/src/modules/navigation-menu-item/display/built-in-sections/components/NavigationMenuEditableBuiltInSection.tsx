import { useLingui } from '@lingui/react/macro';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { NavigationMenuBuiltInSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuBuiltInSection';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
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
  const { isBuiltInSectionAvailable } =
    useNavigationMenuBuiltInSectionAvailability();
  const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
    ({ key }) => key === section.builtInSectionKey,
  );

  if (builtInSection === undefined) {
    return null;
  }

  const sectionMenu = <NavigationMenuSectionMenu section={section} />;
  const canShowContent =
    builtInSection.key !== 'favorites' &&
    isBuiltInSectionAvailable(builtInSection.key);

  if (canShowContent) {
    return (
      <NavigationMenuBuiltInSection
        section={section}
        headerAction={sectionMenu}
      />
    );
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerSectionTitle
        label={t(builtInSection.label)}
        rightIcon={sectionMenu}
        alwaysShowRightIcon
      />
    </NavigationDrawerSection>
  );
};

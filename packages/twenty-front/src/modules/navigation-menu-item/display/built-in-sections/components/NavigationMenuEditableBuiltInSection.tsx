import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { NavigationMenuBuiltInSection } from '@/navigation-menu-item/display/built-in-sections/components/NavigationMenuBuiltInSection';
import { NavigationMenuSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuSectionMenu';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type NavigationMenuEditableBuiltInSectionProps = {
  section: Pick<
    NavigationMenuItem,
    'id' | 'name' | 'icon' | 'parentId' | 'type'
  >;
};

export const NavigationMenuEditableBuiltInSection = ({
  section,
}: NavigationMenuEditableBuiltInSectionProps) => {
  const { t } = useLingui();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
    ({ type }) => type === section.type,
  );

  if (builtInSection === undefined) {
    return null;
  }

  const sectionMenu = <NavigationMenuSectionMenu section={section} />;
  const canShowContent =
    builtInSection.type !== NavigationMenuItemType.FAVORITES &&
    hasAiPermission &&
    isAiChatInboxEnabled;

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

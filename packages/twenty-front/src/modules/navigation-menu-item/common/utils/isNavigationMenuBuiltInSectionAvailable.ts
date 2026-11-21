import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';

export const isNavigationMenuBuiltInSectionAvailable = ({
  builtInSectionKey,
  hasAiPermission,
  isAiChatInboxEnabled,
}: {
  builtInSectionKey: string | null | undefined;
  hasAiPermission: boolean;
  isAiChatInboxEnabled: boolean;
}) => {
  const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
    ({ key }) => key === builtInSectionKey,
  );

  if (!isDefined(builtInSection)) {
    return false;
  }

  if (!builtInSection.isAi) {
    return true;
  }

  return (
    hasAiPermission &&
    (!builtInSection.isAiChatInboxRequired || isAiChatInboxEnabled)
  );
};

import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useIsNavigationMenuBuiltInSectionAvailable = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  return (builtInSectionKey: string | null | undefined) => {
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
      (!builtInSection.requiresAiChatInbox || isAiChatInboxEnabled)
    );
  };
};

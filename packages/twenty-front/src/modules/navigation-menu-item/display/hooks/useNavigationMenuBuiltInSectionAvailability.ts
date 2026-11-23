import { isNavigationMenuBuiltInSectionAvailable } from '@/navigation-menu-item/common/utils/isNavigationMenuBuiltInSectionAvailable';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useNavigationMenuBuiltInSectionAvailability = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const isBuiltInSectionAvailable = (
    builtInSectionKey: string | null | undefined,
  ) =>
    isNavigationMenuBuiltInSectionAvailable({
      builtInSectionKey,
      hasAiPermission,
      isAiChatInboxEnabled,
    });

  return { isBuiltInSectionAvailable };
};

import { getSettingsAiModelsSectionVisibility } from '@/settings/ai/utils/getSettingsAiModelsSectionVisibility';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useSettingsAiModelsSectionVisibility = () => {
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const canReadSystemPrompts = useHasPermissionFlag(PermissionFlagType.AI);

  return getSettingsAiModelsSectionVisibility({
    isInboxEnabled,
    canReadSystemPrompts,
  });
};

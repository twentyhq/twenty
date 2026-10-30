import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

// Where a signed-in person lands, as opposed to the record home that "back"
// and drawer navigation return to. Chat-first workspaces land on chat only
// when the person can actually use it, so an instance without a model never
// bounces people into a chat that cannot answer.
export const useLandingPagePath = () => {
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isChatFirstEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SETU_CHAT_FIRST_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const aiModels = useAtomStateValue(aiModelsState);
  const isMobile = useIsMobile();

  const isWaitingForRecordHome =
    defaultHomePagePath === AppPath.Index ||
    defaultHomePagePath === AppPath.SignInUp;

  const landingPagePath =
    isChatFirstEnabled &&
    hasAiPermission &&
    aiModels.length > 0 &&
    !isMobile &&
    !isWaitingForRecordHome
      ? getAppPath(AppPath.AiChat, { threadId: null })
      : defaultHomePagePath;

  return { landingPagePath };
};

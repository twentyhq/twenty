import { getAppPath, isDefined, isValidUuid } from 'twenty-shared/utils';

import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useLegacyAiChatInboxRedirectPath = (
  urlThreadId: string | undefined,
) => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  if (!isAiChatInboxEnabled) {
    return null;
  }

  const inboxRoute = getAiChatPageRoute({
    isInbox: true,
    threadId:
      isDefined(urlThreadId) && isValidUuid(urlThreadId) ? urlThreadId : null,
  });

  return getAppPath(inboxRoute.appPath, { threadId: inboxRoute.threadId });
};

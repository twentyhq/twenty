import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatThreadInboxStatusByThreadIdFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusByThreadIdFamilySelector';
import { getAiChatThreadTriageStatus } from '@/ai/utils/getAiChatThreadTriageStatus';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

export const useAiChatThreadTriage = (threadId: string) => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const location = useLocation();
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const { [threadId]: inboxStatus } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusByThreadIdFamilySelector,
    {
      threadIds: [threadId],
      channelId: isAiChatInboxPath(location.pathname)
        ? (agentChatShownChannelView?.channelId ?? null)
        : null,
    },
  );

  return {
    status: getAiChatThreadTriageStatus({
      hasAiPermission,
      isInboxEnabled,
      areParticipantsLoaded: isDefined(agentChatThreadParticipants),
      scope: inboxStatus?.scope ?? 'NONE',
    }),
    isInChannel: inboxStatus?.isChannelCopy ?? false,
  };
};

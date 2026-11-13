import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatSelectedChannelViewSelector } from '@/ai/states/selectors/agentChatSelectedChannelViewSelector';
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

export const useAiChatThreadTriage = ({
  threadId,
  channelIdOutsideInbox,
}: {
  threadId: string;
  channelIdOutsideInbox?: string | null;
}) => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const location = useLocation();
  const agentChatSelectedChannelView = useAtomStateValue(
    agentChatSelectedChannelViewSelector,
  );
  const channelId = isAiChatInboxPath(location.pathname)
    ? (agentChatSelectedChannelView?.channelId ?? null)
    : (channelIdOutsideInbox ?? null);
  const { [threadId]: inboxStatus } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusByThreadIdFamilySelector,
    { threadIds: [threadId], channelId },
  );
  const isInChannel = inboxStatus?.isChannelCopy ?? false;

  return {
    status: getAiChatThreadTriageStatus({
      hasAiPermission,
      isInboxEnabled,
      areParticipantsLoaded:
        isInChannel || isDefined(agentChatThreadParticipants),
      scope: inboxStatus?.scope ?? 'NONE',
    }),
    isInChannel,
    channelId,
  };
};

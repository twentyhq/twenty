import { useLocation } from 'react-router-dom';

import { aiChatThreadParticipantsAreLoadedSelector } from '@/ai-chat/threads/states/selectors/aiChatThreadParticipantsAreLoadedSelector';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { inboxThreadInboxStatusByThreadIdFamilySelector } from '@/inbox/states/selectors/inboxThreadInboxStatusByThreadIdFamilySelector';
import { getInboxThreadTriageStatus } from '@/inbox/utils/getInboxThreadTriageStatus';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isInboxPath } from '~/utils/isInboxPath';

export const useInboxThreadTriage = ({
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
  const areAiChatThreadParticipantsLoaded = useAtomStateValue(
    aiChatThreadParticipantsAreLoadedSelector,
  );
  const location = useLocation();
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const channelId = isInboxPath(location.pathname)
    ? (inboxSelectedChannelView?.channelId ?? null)
    : (channelIdOutsideInbox ?? null);
  const { [threadId]: inboxStatus } = useAtomFamilySelectorValue(
    inboxThreadInboxStatusByThreadIdFamilySelector,
    { threadIds: [threadId], channelId },
  );
  const isInChannel = inboxStatus?.isChannelCopy ?? false;

  return {
    status: getInboxThreadTriageStatus({
      hasAiPermission,
      isInboxEnabled,
      areParticipantsLoaded: isInChannel || areAiChatThreadParticipantsLoaded,
      scope: inboxStatus?.scope ?? 'NONE',
    }),
    isInChannel,
    channelId,
  };
};

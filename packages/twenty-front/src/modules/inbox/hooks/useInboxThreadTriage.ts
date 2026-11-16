import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { inboxThreadMemberStateByThreadIdFamilySelector } from '@/inbox/states/selectors/inboxThreadMemberStateByThreadIdFamilySelector';
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
  const aiChatThreadParticipants = useAtomStateValue(
    aiChatThreadParticipantsState,
  );
  const location = useLocation();
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const channelId = isInboxPath(location.pathname)
    ? (inboxSelectedChannelView?.channelId ?? null)
    : (channelIdOutsideInbox ?? null);
  const { [threadId]: inboxStatus } = useAtomFamilySelectorValue(
    inboxThreadMemberStateByThreadIdFamilySelector,
    { threadIds: [threadId], channelId },
  );
  const isInChannel = inboxStatus?.isChannelCopy ?? false;

  return {
    status: getInboxThreadTriageStatus({
      hasAiPermission,
      isInboxEnabled,
      areParticipantsLoaded: isInChannel || isDefined(aiChatThreadParticipants),
      scope: inboxStatus?.scope ?? 'NONE',
    }),
    isInChannel,
    channelId,
  };
};

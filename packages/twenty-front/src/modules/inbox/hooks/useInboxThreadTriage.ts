import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { useInboxThreadMemberStateByThreadId } from '@/inbox/hooks/useInboxThreadMemberStateByThreadId';
import { getInboxThreadTriageStatus } from '@/inbox/utils/getInboxThreadTriageStatus';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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
  const {
    inboxThreadMemberStateByThreadId: { [threadId]: inboxStatus },
    channelId,
  } = useInboxThreadMemberStateByThreadId({
    threadIds: [threadId],
    channelIdOutsideInbox,
  });
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

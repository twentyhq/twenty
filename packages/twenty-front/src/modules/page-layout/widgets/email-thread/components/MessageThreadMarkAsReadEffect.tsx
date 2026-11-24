import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useMarkAppChannelThreadAsRead } from '@/activities/emails/hooks/useMarkAppChannelThreadAsRead';
import { useMarkMessageThreadAsRead } from '@/activities/emails/hooks/useMarkMessageThreadAsRead';
import { useReplyConnectedAccount } from '@/activities/emails/hooks/useReplyConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isImpersonatingState } from '@/auth/states/isImpersonatingState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type MessageThreadMarkAsReadEffectProps = {
  messageChannelId: string | null;
  messageThreadId: string;
  latestMessageId: string;
};

export const MessageThreadMarkAsReadEffect = ({
  messageChannelId,
  messageThreadId,
  latestMessageId,
}: MessageThreadMarkAsReadEffectProps) => {
  const { markAppChannelThreadAsRead } = useMarkAppChannelThreadAsRead();
  const { markMessageThreadAsRead } = useMarkMessageThreadAsRead();
  const { messageChannel, connectedAccount } =
    useReplyConnectedAccount(messageChannelId);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isImpersonating = useAtomStateValue(isImpersonatingState);
  const hasSendPermission = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );

  const userWorkspaceId = currentWorkspaceMember?.userWorkspaceId;
  const isOwnedChannel =
    isDefined(messageChannel) &&
    isDefined(connectedAccount) &&
    isNonEmptyString(userWorkspaceId) &&
    connectedAccount.userWorkspaceId === userWorkspaceId;
  const isOwnedAppChannel =
    isOwnedChannel &&
    isNonEmptyString(messageChannel.messagingProviderUniversalIdentifier) &&
    messageChannel.isSyncEnabled;
  const appChannelIdToMark =
    hasSendPermission && isOwnedAppChannel ? messageChannel.id : null;
  const shouldMarkReadInTwenty = isOwnedChannel && !isImpersonating;

  useEffect(() => {
    if (!shouldMarkReadInTwenty) {
      return;
    }

    markMessageThreadAsRead(messageThreadId);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldMarkReadInTwenty, messageThreadId, latestMessageId]);

  useEffect(() => {
    if (!isDefined(appChannelIdToMark)) {
      return;
    }

    markAppChannelThreadAsRead({
      messageChannelId: appChannelIdToMark,
      messageThreadId,
    });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [appChannelIdToMark, messageThreadId, latestMessageId]);

  return <></>;
};

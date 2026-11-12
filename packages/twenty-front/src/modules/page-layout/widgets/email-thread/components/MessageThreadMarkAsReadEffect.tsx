import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useMarkAppChannelThreadAsRead } from '@/activities/emails/hooks/useMarkAppChannelThreadAsRead';
import { useReplyConnectedAccount } from '@/activities/emails/hooks/useReplyConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type MessageThreadMarkAsReadEffectProps = {
  messageChannelId: string | null;
  messageThreadId: string;
};

export const MessageThreadMarkAsReadEffect = ({
  messageChannelId,
  messageThreadId,
}: MessageThreadMarkAsReadEffectProps) => {
  const { markAppChannelThreadAsRead } = useMarkAppChannelThreadAsRead();
  const { messageChannel, connectedAccount } =
    useReplyConnectedAccount(messageChannelId);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const hasSendPermission = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );

  const userWorkspaceId = currentWorkspaceMember?.userWorkspaceId;
  // only app channels have a messaging provider, and upstream read state belongs to the account owner
  const isOwnedAppChannel =
    isDefined(messageChannel) &&
    isNonEmptyString(messageChannel.messagingProviderUniversalIdentifier) &&
    messageChannel.isSyncEnabled &&
    isDefined(connectedAccount) &&
    isNonEmptyString(userWorkspaceId) &&
    connectedAccount.userWorkspaceId === userWorkspaceId;
  const appChannelIdToMark =
    hasSendPermission && isOwnedAppChannel ? messageChannel.id : null;

  // Threads open from many places (timeline, record pages, links), so the opened widget is the one place that sees them all.
  useEffect(() => {
    if (!isDefined(appChannelIdToMark)) {
      return;
    }

    markAppChannelThreadAsRead({
      messageChannelId: appChannelIdToMark,
      messageThreadId,
    });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [appChannelIdToMark, messageThreadId]);

  return <></>;
};

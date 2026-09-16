import { useQuery } from '@apollo/client/react';
import { EmailOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformEmailOperation,
  isDefined,
} from 'twenty-shared/utils';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import {
  MessageChannelType,
  MyMessageChannelsDocument,
} from '~/generated-metadata/graphql';

export type InboxReplyAccount = {
  connectedAccountId: string;
  connectedAccountHandle: string;
};

// A shared inbox answers from the address its mail arrived on, so the group
// channel routed into the item's queue comes first. Then the channel that
// received the thread, when the viewer may send from it, then the viewer's
// only mailbox when there is exactly one. Nothing here is a guess the From
// picker would not have offered.
export const useInboxReplyAccount = ({
  queueId,
  receivingMessageChannelId,
}: {
  queueId: string | null | undefined;
  receivingMessageChannelId: string | null;
}): { replyAccount: InboxReplyAccount | null; loading: boolean } => {
  const { data: accountsData, loading: accountsLoading } = useQuery<{
    myConnectedAccounts: Pick<
      ConnectedAccount,
      'id' | 'handle' | 'handleAliases' | 'provider' | 'connectionParameters'
    >[];
  }>(GET_MY_CONNECTED_ACCOUNTS);
  const { data: channelsData, loading: channelsLoading } = useQuery(
    MyMessageChannelsDocument,
  );

  const sendableAccounts = (accountsData?.myConnectedAccounts ?? []).filter(
    (connectedAccount) =>
      canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.SEND,
      }),
  );
  const messageChannels = channelsData?.myMessageChannels ?? [];

  const findSendableAccount = (connectedAccountId: string | null | undefined) =>
    sendableAccounts.find(
      (connectedAccount) => connectedAccount.id === connectedAccountId,
    );

  const queueGroupChannel = isDefined(queueId)
    ? messageChannels.find(
        (messageChannel) =>
          messageChannel.type === MessageChannelType.EMAIL_GROUP &&
          messageChannel.defaultInboxQueueId === queueId,
      )
    : undefined;
  const receivingChannel = messageChannels.find(
    (messageChannel) => messageChannel.id === receivingMessageChannelId,
  );

  const account =
    findSendableAccount(queueGroupChannel?.connectedAccountId) ??
    findSendableAccount(receivingChannel?.connectedAccountId) ??
    (sendableAccounts.length === 1 ? sendableAccounts[0] : undefined);

  return {
    replyAccount: isDefined(account)
      ? { connectedAccountId: account.id, connectedAccountHandle: account.handle }
      : null,
    loading: accountsLoading || channelsLoading,
  };
};

import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { type ConversationStartMessageChannel } from '@/activities/emails/types/ConversationStartMessageChannel';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  MessageChannelType,
  MyConversationStartMessageChannelsDocument,
} from '~/generated-metadata/graphql';

export const useConversationStartMessageChannels = ({
  isSkipped = false,
}: { isSkipped?: boolean } = {}): ConversationStartMessageChannel[] => {
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);
  const { data } = useQuery(MyConversationStartMessageChannelsDocument, {
    skip: isSkipped,
  });

  if (isSkipped) {
    return [];
  }

  return (data?.myMessageChannels ?? []).flatMap((messageChannel) => {
    const connectedAccount = myConnectedAccounts?.find(
      ({ id }) => id === messageChannel.connectedAccountId,
    );

    if (
      messageChannel.type !== MessageChannelType.APP ||
      !messageChannel.isSyncEnabled ||
      !messageChannel.canStartConversation ||
      !isDefined(connectedAccount) ||
      isApplicationConnectionReconnectNeeded(connectedAccount)
    ) {
      return [];
    }

    return [
      {
        messageChannelId: messageChannel.id,
        label: isNonEmptyString(messageChannel.displayName)
          ? messageChannel.displayName
          : messageChannel.handle,
        provider: connectedAccount.provider,
        applicationId: connectedAccount.applicationId ?? null,
      },
    ];
  });
};

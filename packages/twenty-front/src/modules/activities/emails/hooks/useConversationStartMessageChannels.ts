import { isNonEmptyString } from '@sniptt/guards';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { type ConversationStartMessageChannel } from '@/activities/emails/types/ConversationStartMessageChannel';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useConversationStartMessageChannels = ({
  isSkipped = false,
}: { isSkipped?: boolean } = {}): ConversationStartMessageChannel[] => {
  const myConnectedAccounts = useAtomStateValue(myConnectedAccountsState);
  const { channels } = useMyMessageChannels(undefined, { skip: isSkipped });

  if (isSkipped) {
    return [];
  }

  return channels.flatMap((messageChannel) => {
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

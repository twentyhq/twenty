import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  MyConnectedAccountsDocument,
  MyMessageChannelsDocument,
} from '~/generated-metadata/graphql';

export const useChatReplyChannel = (messageChannelId: string | null) => {
  const { data: messageChannelsData } = useQuery(MyMessageChannelsDocument);
  const { data: connectedAccountsData } = useQuery(MyConnectedAccountsDocument);
  const { applicationsWithPreferences } = useApplicationsWithPreferences();

  const messageChannel = messageChannelsData?.myMessageChannels.find(
    ({ id }) => id === messageChannelId,
  );

  const connectedAccount = connectedAccountsData?.myConnectedAccounts.find(
    ({ id }) => id === messageChannel?.connectedAccountId,
  );

  const connectionProvider = applicationsWithPreferences
    .flatMap(({ connectionProviders }) => connectionProviders)
    .find(({ id }) => id === connectedAccount?.connectionProviderId);

  if (
    !isDefined(messageChannel) ||
    !isDefined(connectedAccount) ||
    !isDefined(connectionProvider)
  ) {
    return null;
  }

  return { messageChannel, connectedAccount, connectionProvider };
};

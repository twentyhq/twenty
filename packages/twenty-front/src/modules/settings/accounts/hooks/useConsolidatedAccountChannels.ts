import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { createConsolidatedAccountChannelsQueryOrThrow } from '@/settings/accounts/utils/createConsolidatedAccountChannelsQueryOrThrow';
import { useQuery } from '@apollo/client/react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ConsolidatedAccountChannelsQuery = {
  [alias: `messageChannels${number}`]: MessageChannel[];
  [alias: `calendarChannels${number}`]: CalendarChannel[];
};

export const useConsolidatedAccountChannels = (
  accounts: Pick<ConsolidatedConnectedAccount, 'id' | 'provider'>[],
) => {
  const nativeAccountIds = accounts
    .filter((account) => account.provider !== ConnectedAccountProvider.APP)
    .map((account) => account.id);
  const { query, variables } =
    createConsolidatedAccountChannelsQueryOrThrow(nativeAccountIds);
  const { data, previousData, loading, error, refetch } =
    useQuery<ConsolidatedAccountChannelsQuery>(query, {
      variables,
      skip: nativeAccountIds.length === 0,
      errorPolicy: 'all',
    });
  const currentAccountIds = new Set(nativeAccountIds);
  const channelData = data ?? previousData;
  const aliases = Object.keys(channelData ?? {});
  const messageChannels = aliases
    .filter((alias) => alias.startsWith('messageChannels'))
    .flatMap(
      (alias) =>
        channelData?.[
          `messageChannels${Number(alias.slice('messageChannels'.length))}`
        ] ?? [],
    )
    .filter((channel) => currentAccountIds.has(channel.connectedAccountId));
  const calendarChannels = aliases
    .filter((alias) => alias.startsWith('calendarChannels'))
    .flatMap(
      (alias) =>
        channelData?.[
          `calendarChannels${Number(alias.slice('calendarChannels'.length))}`
        ] ?? [],
    )
    .filter((channel) => currentAccountIds.has(channel.connectedAccountId));

  const refetchChannels = () => {
    if (nativeAccountIds.length === 0) {
      return;
    }
    return refetch();
  };

  return {
    messageChannels,
    calendarChannels,
    loading,
    hasData: isDefined(data ?? previousData),
    error,
    refetch: refetchChannels,
  };
};

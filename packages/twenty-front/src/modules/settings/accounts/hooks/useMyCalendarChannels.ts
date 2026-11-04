import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { GET_MY_CALENDAR_CHANNELS } from '@/settings/accounts/graphql/queries/getMyCalendarChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

export const useMyCalendarChannels = () => {
  const apolloClient = useApolloClient();

  const { data, loading } = useQuery<{
    myCalendarChannels: CalendarChannel[];
  }>(GET_MY_CALENDAR_CHANNELS, {
    client: apolloClient,
  });

  return {
    channels: data?.myCalendarChannels ?? [],
    loading,
    hasLoaded: isDefined(data),
  };
};

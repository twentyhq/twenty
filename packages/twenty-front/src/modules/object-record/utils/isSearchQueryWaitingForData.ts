import { type DataState } from '@apollo/client';

// With cache-and-network, a cache hit for the current input is complete while it still refreshes
export const isSearchQueryWaitingForData = ({
  loading,
  dataState,
}: {
  loading: boolean;
  dataState: DataState<unknown>['dataState'];
}): boolean => loading && dataState !== 'complete';

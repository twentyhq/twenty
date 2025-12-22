import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { createClient } from 'graphql-sse';
import { useMemo } from 'react';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const useSseClient = () => {
  const tokenPair = getTokenPair();
  const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

  const sseClient = useMemo(
    () =>
      createClient({
        url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }),
    [token],
  );

  return {
    sseClient,
  };
};

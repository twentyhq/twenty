import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { SSEClientEffect } from '@/sse-db-event/components/SSEClientEffect';
import { SSEEventStreamEffect } from '@/sse-db-event/components/SSEEventStreamEffect';
import { SSEQuerySubscribeEffect } from '@/sse-db-event/components/SSEQuerySubscribeEffect';
import { SseClientContext } from '@/sse-db-event/contexts/SseClientContext';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { createClient } from 'graphql-sse';
import { type ReactNode } from 'react';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type SSEProviderProps = {
  children: ReactNode;
};

export const SSEProvider = ({ children }: SSEProviderProps) => {
  const isSseDbEventsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SSE_DB_EVENTS_ENABLED,
  );

  if (!isSseDbEventsEnabled) {
    const tokenPair = getTokenPair();
    const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

    const sseClient = createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/metadata`,
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    return (
      <SseClientContext.Provider value={sseClient}>
        {children}
      </SseClientContext.Provider>
    );
  }

  return (
    <>
      <SSEClientEffect />
      <SSEEventStreamEffect />
      <SSEQuerySubscribeEffect />
      {children}
    </>
  );
};

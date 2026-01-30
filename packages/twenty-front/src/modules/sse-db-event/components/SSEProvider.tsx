import { SSEEventStreamEffect } from '@/sse-db-event/components/SSEEventStreamEffect';
import { SSEQuerySubscribeEffect } from '@/sse-db-event/components/SSEQuerySubscribeEffect';
import { SseClientContext } from '@/sse-db-event/contexts/SseClientContext';
import { useSseClient } from '@/sse-db-event/hooks/useSseClient.util';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { type ReactNode } from 'react';
import { FeatureFlagKey } from '~/generated/graphql';

type SSEProviderProps = {
  children: ReactNode;
};

export const SSEProvider = ({ children }: SSEProviderProps) => {
  const isSseDbEventsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SSE_DB_EVENTS_ENABLED,
  );
  const { sseClient } = useSseClient();

  if (!isSseDbEventsEnabled) {
    return (
      <SseClientContext.Provider value={null}>
        {children}
      </SseClientContext.Provider>
    );
  }

  return (
    <SseClientContext.Provider value={sseClient}>
      <SSEEventStreamEffect />
      <SSEQuerySubscribeEffect />
      {children}
    </SseClientContext.Provider>
  );
};

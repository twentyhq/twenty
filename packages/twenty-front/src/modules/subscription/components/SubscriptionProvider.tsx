import { SseClientContext } from '@/subscription/contexts/SseClientContext';
import { useSseClient } from '@/subscription/hooks/useSseClient.util';
import { type ReactNode } from 'react';

type SubscriptionProviderProps = {
  children: ReactNode;
};

export const SubscriptionProvider = ({
  children,
}: SubscriptionProviderProps) => {
  const { sseClient } = useSseClient();

  return (
    <SseClientContext.Provider value={sseClient}>
      {children}
    </SseClientContext.Provider>
  );
};

import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { invalidateToolIndex as invalidateToolIndexForClient } from '@/ai/utils/invalidateToolIndex';

export const useInvalidateToolIndex = () => {
  const client = useApolloClient();

  const invalidateToolIndex = useCallback(() => {
    invalidateToolIndexForClient(client).catch(() => undefined);
  }, [client]);

  return { invalidateToolIndex };
};

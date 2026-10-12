import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { useEffect } from 'react';

export const ApolloDevLogEffect = () => {
  const isDebugMode = process.env.IS_DEBUG_MODE === 'true';

  useEffect(() => {
    if (isDebugMode) {
      loadDevMessages();
      loadErrorMessages();
    }
  }, [isDebugMode]);

  return null;
};

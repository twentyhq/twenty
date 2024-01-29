import { useEffect } from 'react';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';

export const ApolloDevLogEffect = () => {
  useEffect(() => {
    loadDevMessages();
    loadErrorMessages();
  }, []);

  return null;
};

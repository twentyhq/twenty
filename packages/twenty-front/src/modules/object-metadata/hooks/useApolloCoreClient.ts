import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { useApolloClient } from '@apollo/client/react';
import { useContext } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useApolloCoreClient = () => {
  const apolloCoreClient = useContext(ApolloCoreClientContext);
  const apolloClient = useApolloClient();

  if (process.env.NODE_ENV === 'test') {
    return apolloClient;
  }

  if (!apolloCoreClient) {
    throw new Error(doNotTranslate('ApolloCoreClient not found'));
  }

  return apolloCoreClient;
};

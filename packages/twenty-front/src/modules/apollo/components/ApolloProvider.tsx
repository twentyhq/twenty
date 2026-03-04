import {
  ApolloProvider as ApolloProviderBase,
  InMemoryCache,
} from '@apollo/client';
import { useMemo } from 'react';

import { useApolloClientCachePersist } from '@/apollo/hooks/useApolloClientCachePersist';
import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { createCaptchaRefreshLink } from '@/apollo/utils/captchaRefreshLink';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const createMetadataCache = () =>
  new InMemoryCache({
    typePolicies: {
      RemoteTable: {
        keyFields: ['name'],
      },
    },
  });

export const ApolloProvider = ({ children }: React.PropsWithChildren) => {
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const captchaRefreshLink = createCaptchaRefreshLink(requestFreshCaptchaToken);

  // Stable cache instance for the metadata Apollo client only

  const metadataCache = useMemo(() => createMetadataCache(), []);
  const { isRestored } = useApolloClientCachePersist(metadataCache);

  const apolloClient = useApolloFactory({
    uri: `${REACT_APP_SERVER_BASE_URL}/metadata`,
    cache: metadataCache,
    connectToDevTools: true,
    extraLinks: [captchaRefreshLink],
  });

  // Expose Apollo client in development to Apollo Dev Tools
  if (process.env.NODE_ENV === 'development') {
    window.__APOLLO_CLIENT__ = apolloClient;
  }

  if (!isRestored) {
    return null;
  }

  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
};

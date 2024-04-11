import { ApolloProvider as ApolloProviderBase } from '@apollo/client';

import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';

export const ApolloProvider = ({ children }: React.PropsWithChildren) => {
  const apolloClient = useApolloFactory({
    connectToDevTools: true,
  });

  // This will attach the right apollo client to Apollo Dev Tools
  window.__APOLLO_CLIENT__ = apolloClient;

  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
};

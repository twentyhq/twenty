import { ApolloProvider as ApolloProviderBase } from '@apollo/client';

import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';

export function ApolloProvider({ children }: React.PropsWithChildren) {
  const apolloClient = useApolloFactory();

  console.log('ApolloProvider', apolloClient);

  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
}

import { ApolloProvider as ApolloProviderBase } from '@apollo/client';

import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';

export const ApolloProvider = ({ children }: React.PropsWithChildren) => {
  const apolloClient = useApolloFactory();

  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
};

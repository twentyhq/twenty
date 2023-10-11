import {
  ApolloClient,
  ApolloProvider as ApolloProviderBase,
  InMemoryCache,
} from '@apollo/client';
import { useRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';

export const MetadataApolloProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [tokenPair] = useRecoilState(tokenPairState);

  const apolloClient = new ApolloClient({
    uri: `${process.env.REACT_APP_SERVER_BASE_URL}/metadata`,
    cache: new InMemoryCache(),
    headers: tokenPair?.accessToken.token
      ? {
          Authorization: `Bearer ${tokenPair.accessToken.token}`,
        }
      : undefined,
  });

  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
};

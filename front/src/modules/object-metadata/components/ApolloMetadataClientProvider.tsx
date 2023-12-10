import { useMemo } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

import { ApolloMetadataClientContext } from '../context/ApolloClientMetadataContext';

export const ApolloMetadataClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tokenPair] = useRecoilState(tokenPairState);
  const apolloMetadataClient = useMemo(() => {
    if (tokenPair?.accessToken.token) {
      return new ApolloClient({
        uri: `${REACT_APP_SERVER_BASE_URL}/metadata`,
        cache: new InMemoryCache(),
        headers: {
          Authorization: `Bearer ${tokenPair.accessToken.token}`,
        },
      });
    } else {
      return null;
    }
  }, [tokenPair]);

  return (
    <ApolloMetadataClientContext.Provider value={apolloMetadataClient}>
      {children}
    </ApolloMetadataClientContext.Provider>
  );
};

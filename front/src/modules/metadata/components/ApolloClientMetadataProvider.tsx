/* eslint-disable no-console */
import { useMemo } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';

import { ApolloClientMetadataContext } from '../context/ApolloClientMetadataContext';

export const ApolloClientMetadataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tokenPair] = useRecoilState(tokenPairState);

  const apolloClientMetadata = useMemo(() => {
    if (tokenPair?.accessToken.token) {
      return new ApolloClient({
        uri: `${process.env.REACT_APP_SERVER_BASE_URL}/metadata`,
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
    <ApolloClientMetadataContext.Provider value={apolloClientMetadata}>
      {children}
    </ApolloClientMetadataContext.Provider>
  );
};

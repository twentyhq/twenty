import { ApolloProvider as ApolloProviderBase } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { isMockModeState } from '@/auth/states/isMockModeState';

import { apolloClient } from './apollo-client';
import { mockClient } from './mock-client';

export const ApolloProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isMockMode] = useRecoilState(isMockModeState);

  return (
    <ApolloProviderBase client={isMockMode ? mockClient : apolloClient}>
      {children}
    </ApolloProviderBase>
  );
};

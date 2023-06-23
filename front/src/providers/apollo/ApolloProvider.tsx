import { ApolloProvider as ApolloProviderBase } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import useApolloMocked from '@/apollo/hooks/useApolloMocked';
import { isMockModeState } from '@/auth/states/isMockModeState';

export const ApolloProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const apolloClient = useApolloFactory();
  const mockedClient = useApolloMocked();

  const [isMockMode] = useRecoilState(isMockModeState);

  return (
    <ApolloProviderBase client={isMockMode ? mockedClient : apolloClient}>
      {children}
    </ApolloProviderBase>
  );
};

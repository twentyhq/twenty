import { useMemo } from 'react';
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  from,
  InMemoryCache,
} from '@apollo/client';

import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedUsersData } from '~/testing/mock-data/users';

export default function useApolloMocked() {
  const mockedClient = useMemo(() => {
    const apiLink = createHttpLink({
      uri: `${process.env.REACT_APP_API_URL}`,
    });

    const mockLink = new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        if (operation.operationName === 'GetCompanies') {
          return { data: { companies: mockedCompaniesData } };
        }
        if (operation.operationName === 'Verify') {
          return {
            data: { verify: { user: [mockedUsersData[0]], tokens: {} } },
          };
        }
        return response;
      });
    });

    return new ApolloClient({
      link: from([mockLink, apiLink]),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'cache-first',
        },
      },
    });
  }, []);

  return mockedClient;
}

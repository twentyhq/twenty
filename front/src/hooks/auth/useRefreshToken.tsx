import { gql, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { authClient } from '../../apollo';

export const GET_TOKEN = gql`
  fragment Payload on REST {
    refreshToken: String
  }
  query jwt($input: Payload) {
    token(input: $input) @rest(type: "string", path: "/token", method: "POST") {
      accessToken
    }
  }
`;

export const useRefreshToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const { data, loading } = useQuery(GET_TOKEN, {
    client: authClient,
    variables: { input: { refreshToken } },
  });
  useEffect(() => {
    if (!loading) {
      const accessToken = data.token.accessToken;
      if (refreshToken && accessToken) {
        localStorage.setItem('accessToken', accessToken || '');
      }
    }
  }, [data, refreshToken, loading]);

  return { loading };
};

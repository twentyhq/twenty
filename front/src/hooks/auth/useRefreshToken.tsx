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
  const { data, loading, error } = useQuery(GET_TOKEN, {
    client: authClient,
    variables: { input: { refreshToken } },
  });
  useEffect(() => {
    if (!loading && !error) {
      const accessToken = data.token.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken || '');
      }
    }
  }, [data, refreshToken, loading, error]);

  return { loading, error };
};

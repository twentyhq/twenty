import { ApolloError, useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import { User } from '../../interfaces/user.interface';
import { useGetUserEmailFromToken } from '../AuthenticationHooks';

const GET_USER_PROFILE = gql`
  query GetUserProfile($email: String!) {
    users(where: { email: { _eq: $email } }, limit: 1) {
      id
      email
      first_name
      last_name
      tenant {
        id
        name
      }
    }
  }
`;

type ProfileResult = {
  loading: boolean;
  error?: ApolloError;
  user?: User;
};

export const useGetProfile = (): ProfileResult => {
  const email = useGetUserEmailFromToken();
  const { loading, error, data } = useQuery(GET_USER_PROFILE, {
    variables: { email },
  });
  return { loading, error, user: data?.users[0] };
};

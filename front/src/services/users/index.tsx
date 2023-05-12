import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryUser } from '../../interfaces/user.interface';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser($uuid: uuid) {
    users(where: { id: { _eq: $uuid } }) {
      id
      email
      displayName
      workspace_member {
        workspace {
          id
          domain_name
          display_name
          logo
        }
      }
    }
  }
`;

export function useGetCurrentUserQuery(userId: string | null): QueryResult<{
  users: GraphqlQueryUser[];
}> {
  return useQuery<{ users: GraphqlQueryUser[] }>(GET_CURRENT_USER, {
    variables: {
      uuid: userId,
    },
  });
}

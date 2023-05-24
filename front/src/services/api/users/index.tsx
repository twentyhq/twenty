import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryUser } from '../../../interfaces/entities/user.interface';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser($uuid: String) {
    users(where: { id: { equals: $uuid } }) {
      id
      email
      displayName
      WorkspaceMember {
        workspace {
          id
          domain_name: domainName
          display_name: displayName
        }
      }
    }
  }
`;

export function useGetCurrentUserQuery(userId: string | null): QueryResult<{
  users: GraphqlQueryUser[];
}> {
  console.log('useGetCurrentUserQuery', userId);
  return useQuery<{ users: GraphqlQueryUser[] }>(GET_CURRENT_USER, {
    variables: {
      uuid: userId,
    },
  });
}

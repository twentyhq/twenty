import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryUser } from '../../../interfaces/entities/user.interface';

export const GET_CURRENT_USER = gql`
  query getCurrentUser($uuid: String) {
    users: findManyUser(where: { id: { equals: $uuid } }) {
      id
      email
      displayName
      workspaceMember: WorkspaceMember {
        workspace {
          id
          domainName
          displayName
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

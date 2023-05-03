import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryAccountOwner } from '../../interfaces/company.interface';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    users {
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

export function useGetCurrentUserQuery(): QueryResult<{
  users: GraphqlQueryAccountOwner[];
}> {
  return useQuery<{ users: GraphqlQueryAccountOwner[] }>(GET_CURRENT_USER);
}

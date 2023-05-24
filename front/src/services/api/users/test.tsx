import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryUser } from '../../../interfaces/entities/user.interface';

export const GET_CURRENT_USER = gql`
  query getUsers {
    getUsers {
      id
    }
  }
`;


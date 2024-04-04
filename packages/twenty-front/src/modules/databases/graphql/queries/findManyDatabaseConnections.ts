import { gql } from '@apollo/client';

export const GET_MANY_DATABASE_CONNECTIONS = gql`
  query GetManyDatabaseConnections($input: RemoteServerTypeInput!) {
    findManyRemoteServersByType(input: $input) {
      id
      createdAt
      foreignDataWrapperId
      foreignDataWrapperOptions
      foreignDataWrapperType
      updatedAt
    }
  }
`;

import { gql } from '@apollo/client';

export const DATABASE_CONNECTION_FRAGMENT = gql`
  fragment RemoteServerFields on RemoteServer {
    id
    createdAt
    foreignDataWrapperId
    foreignDataWrapperOptions
    foreignDataWrapperType
    userMappingOptions {
      username
    }
    updatedAt
    schema
  }
`;

import { gql } from '@apollo/client';

export const CREATE_ONE_DATABASE_CONNECTION = gql`
  mutation createServer($input: CreateRemoteServerInput!) {
    createOneRemoteServer(input: $input) {
      id
      foreignDataWrapperId
      foreignDataWrapperOptions
      foreignDataWrapperType
    }
  }
`;

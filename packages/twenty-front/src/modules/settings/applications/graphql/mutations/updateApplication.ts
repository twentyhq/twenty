import gql from 'graphql-tag';

export const UPDATE_APPLICATION = gql`
  mutation UpdateApplication($id: UUID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      id
      autoUpgrade
    }
  }
`;

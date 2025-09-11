import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_FIELD = gql`
  mutation DeleteCoreViewField($input: DeleteViewFieldInput!) {
    deleteCoreViewField(input: $input) {
      ...ViewFieldFragment
    }
  }
`;

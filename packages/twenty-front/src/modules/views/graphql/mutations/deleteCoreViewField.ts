import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_FIELD = gql`
  mutation DeleteCoreViewField($id: String!) {
    deleteCoreViewField(id: $id)
  }
`;

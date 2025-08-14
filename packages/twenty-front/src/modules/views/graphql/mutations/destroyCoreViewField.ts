import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW_FIELD = gql`
  mutation DestroyCoreViewField($id: String!) {
    destroyCoreViewField(id: $id)
  }
`;

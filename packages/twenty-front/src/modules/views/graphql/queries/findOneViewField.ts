import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  query FindOneViewField($id: String!) {
    getViewField(id: $id) {
      ...ViewFieldFragment
    }
  }
`;

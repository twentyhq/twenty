import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_CORE_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  query FindOneCoreViewField($id: String!) {
    getCoreViewField(id: $id) {
      ...ViewFieldFragment
    }
  }
`;

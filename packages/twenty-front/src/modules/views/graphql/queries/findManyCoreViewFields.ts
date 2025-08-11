import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_CORE_VIEW_FIELDS = gql`
  ${VIEW_FIELD_FRAGMENT}
  query FindManyCoreViewFields($viewId: String!) {
    getCoreViewFields(viewId: $viewId) {
      ...ViewFieldFragment
    }
  }
`;

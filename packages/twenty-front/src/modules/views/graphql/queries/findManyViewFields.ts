import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_VIEW_FIELDS = gql`
  ${VIEW_FIELD_FRAGMENT}
  query FindManyViewFields($viewId: String!) {
    getViewFields(viewId: $viewId) {
      ...ViewFieldFragment
    }
  }
`;

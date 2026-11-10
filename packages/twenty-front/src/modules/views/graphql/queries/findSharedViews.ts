import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_SHARED_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindSharedViews($viewTypes: [ViewType!]) {
    getSharedViews(viewTypes: $viewTypes) {
      familyVersion
      views {
        ...ViewFragment
      }
    }
  }
`;

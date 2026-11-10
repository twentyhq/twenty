import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_MY_PRIVATE_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindMyPrivateViews($viewTypes: [ViewType!]) {
    getMyPrivateViews(viewTypes: $viewTypes) {
      familyVersion
      views {
        ...ViewFragment
      }
    }
  }
`;

import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_ALL_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindAllViews($viewTypes: [ViewType!]) {
    getViews(viewTypes: $viewTypes) {
      ...ViewFragment
    }
  }
`;

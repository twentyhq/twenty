import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_ALL_CORE_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindAllCoreViews($viewTypes: [ViewType!]) {
    getCoreViews(viewTypes: $viewTypes) {
      ...ViewFragment
    }
  }
`;

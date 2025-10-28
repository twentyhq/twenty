import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_CORE_VIEW = gql`
  ${VIEW_FRAGMENT}
  query FindOneCoreView($id: String!) {
    getCoreView(id: $id) {
      ...ViewFragment
    }
  }
`;

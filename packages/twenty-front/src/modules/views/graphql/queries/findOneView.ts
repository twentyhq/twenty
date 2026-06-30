import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_VIEW = gql`
  ${VIEW_FRAGMENT}
  query FindOneView($id: String!) {
    getView(id: $id) {
      ...ViewFragment
    }
  }
`;

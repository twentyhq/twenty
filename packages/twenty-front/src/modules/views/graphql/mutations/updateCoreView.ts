import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const UPDATE_CORE_VIEW = gql`
  ${VIEW_FRAGMENT}
  mutation UpdateCoreView($id: String!, $input: UpdateViewInput!) {
    updateCoreView(id: $id, input: $input) {
      ...ViewFragment
    }
  }
`;

import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const UPDATE_VIEW = gql`
  ${VIEW_FRAGMENT}
  mutation UpdateView($id: String!, $input: UpdateViewInput!) {
    updateView(id: $id, input: $input) {
      ...ViewFragment
    }
  }
`;

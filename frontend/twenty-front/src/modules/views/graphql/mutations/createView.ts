import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const CREATE_VIEW = gql`
  ${VIEW_FRAGMENT}
  mutation CreateView($input: CreateViewInput!) {
    createView(input: $input) {
      ...ViewFragment
    }
  }
`;

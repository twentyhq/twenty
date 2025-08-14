import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_VIEW = gql`
  ${VIEW_FRAGMENT}
  mutation CreateCoreView($input: CreateViewInput!) {
    createCoreView(input: $input) {
      ...ViewFragment
    }
  }
`;

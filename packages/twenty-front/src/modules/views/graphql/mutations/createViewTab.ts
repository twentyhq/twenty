import { VIEW_TAB_FRAGMENT } from '@/views/graphql/fragments/viewTabFragment';
import { gql } from '@apollo/client';

export const CREATE_VIEW_TAB = gql`
  ${VIEW_TAB_FRAGMENT}
  mutation CreateViewTab($input: CreateViewTabInput!) {
    createViewTab(input: $input) {
      ...ViewTabFragment
    }
  }
`;

import { VIEW_TAB_FRAGMENT } from '@/views/graphql/fragments/viewTabFragment';
import { gql } from '@apollo/client';

export const UPDATE_VIEW_TAB = gql`
  ${VIEW_TAB_FRAGMENT}
  mutation UpdateViewTab($input: UpdateViewTabInput!) {
    updateViewTab(input: $input) {
      ...ViewTabFragment
    }
  }
`;

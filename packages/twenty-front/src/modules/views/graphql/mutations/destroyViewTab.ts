import { VIEW_TAB_FRAGMENT } from '@/views/graphql/fragments/viewTabFragment';
import { gql } from '@apollo/client';

export const DESTROY_VIEW_TAB = gql`
  ${VIEW_TAB_FRAGMENT}
  mutation DestroyViewTab($input: DestroyViewTabInput!) {
    destroyViewTab(input: $input) {
      ...ViewTabFragment
    }
  }
`;

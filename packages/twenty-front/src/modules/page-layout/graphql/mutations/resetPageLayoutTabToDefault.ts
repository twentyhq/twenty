import { gql } from '@apollo/client';

import { PAGE_LAYOUT_TAB_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutTabFragment';

export const RESET_PAGE_LAYOUT_TAB_TO_DEFAULT = gql`
  ${PAGE_LAYOUT_TAB_FRAGMENT}
  mutation ResetPageLayoutTabToDefault($id: String!) {
    resetPageLayoutTabToDefault(id: $id) {
      ...PageLayoutTabFragment
    }
  }
`;

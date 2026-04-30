import { gql } from '@apollo/client';

import { PAGE_LAYOUT_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutFragment';

export const RESET_PAGE_LAYOUT_TO_DEFAULT = gql`
  ${PAGE_LAYOUT_FRAGMENT}
  mutation ResetPageLayoutToDefault($id: String!) {
    resetPageLayoutToDefault(id: $id) {
      ...PageLayoutFragment
    }
  }
`;

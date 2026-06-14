import { gql } from '@apollo/client';

import { PAGE_LAYOUT_WIDGET_FRAGMENT } from '@/page-layout/graphql/fragments/pageLayoutWidgetFragment';

export const RESET_PAGE_LAYOUT_WIDGET_TO_DEFAULT = gql`
  ${PAGE_LAYOUT_WIDGET_FRAGMENT}
  mutation ResetPageLayoutWidgetToDefault($id: String!) {
    resetPageLayoutWidgetToDefault(id: $id) {
      ...PageLayoutWidgetFragment
    }
  }
`;

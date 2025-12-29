import { gql } from '@apollo/client';

import { PAGE_LAYOUT_WIDGET_FRAGMENT } from '@/page-layout/graphql/fragments/pageLayoutWidgetFragment';

export const UPDATE_PAGE_LAYOUT_WITH_TABS_AND_WIDGETS = gql`
  ${PAGE_LAYOUT_WIDGET_FRAGMENT}
  mutation UpdatePageLayoutWithTabsAndWidgets(
    $id: String!
    $input: UpdatePageLayoutWithTabsInput!
  ) {
    updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
      id
      name
      type
      objectMetadataId
      createdAt
      updatedAt
      deletedAt
      tabs {
        id
        title
        position
        pageLayoutId
        widgets {
          ...PageLayoutWidgetFragment
        }
        createdAt
        updatedAt
      }
    }
  }
`;

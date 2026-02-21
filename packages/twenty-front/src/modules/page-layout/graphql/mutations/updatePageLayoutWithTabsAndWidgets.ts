import { PAGE_LAYOUT_TAB_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutTabFragment';
import { gql } from '@apollo/client';

export const UPDATE_PAGE_LAYOUT_WITH_TABS_AND_WIDGETS = gql`
  ${PAGE_LAYOUT_TAB_FRAGMENT}
  mutation UpdatePageLayoutWithTabsAndWidgets(
    $id: String!
    $input: UpdatePageLayoutWithTabsInput!
  ) {
    updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
      id
      name
      type
      objectMetadataId
      defaultTabToFocusOnMobileAndSidePanelId
      createdAt
      updatedAt
      deletedAt
      tabs {
        ...PageLayoutTabFragment
      }
    }
  }
`;

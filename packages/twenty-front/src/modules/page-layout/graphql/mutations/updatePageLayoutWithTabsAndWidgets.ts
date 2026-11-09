import { PAGE_LAYOUT_TAB_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutTabFragment';
import { PAGE_LAYOUT_FILTER_FRAGMENT } from '@/page-layout/graphql/fragments/pageLayoutFilterFragment';
import { gql } from '@apollo/client';

export const UPDATE_PAGE_LAYOUT_WITH_TABS_AND_WIDGETS = gql`
  ${PAGE_LAYOUT_TAB_FRAGMENT}
  ${PAGE_LAYOUT_FILTER_FRAGMENT}
  mutation UpdatePageLayoutWithTabsAndWidgets(
    $id: String!
    $input: UpdatePageLayoutWithTabsInput!
  ) {
    updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
      id
      applicationId
      name
      type
      objectMetadataId
      universalIdentifier
      isSystemSideEffect
      isFirstTabPinned
      defaultTabToFocusOnMobileAndSidePanelId
      filters {
        ...PageLayoutFilterFragment
      }
      createdAt
      updatedAt
      deletedAt
      tabs {
        ...PageLayoutTabFragment
      }
    }
  }
`;

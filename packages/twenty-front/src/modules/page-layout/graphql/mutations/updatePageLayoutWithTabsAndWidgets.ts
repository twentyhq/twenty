import { gql } from '@apollo/client';

export const UPDATE_PAGE_LAYOUT_WITH_TABS_AND_WIDGETS = gql`
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
          id
          title
          type
          pageLayoutTabId
          objectMetadataId
          gridPosition {
            row
            column
            rowSpan
            columnSpan
          }
          configuration
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
    }
  }
`;

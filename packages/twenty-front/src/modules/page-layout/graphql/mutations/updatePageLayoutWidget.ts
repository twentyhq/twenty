import { gql } from '@apollo/client';

export const UPDATE_PAGE_LAYOUT_WIDGET = gql`
  mutation UpdatePageLayoutWidget(
    $id: String!
    $input: UpdatePageLayoutWidgetInput!
  ) {
    updatePageLayoutWidget(id: $id, input: $input) {
      id
      isActive
      position {
        ... on PageLayoutWidgetGridPosition {
          layoutMode
          row
          column
          rowSpan
          columnSpan
        }
        ... on PageLayoutWidgetVerticalListPosition {
          layoutMode
          index
          heightBehavior
        }
        ... on PageLayoutWidgetCanvasPosition {
          layoutMode
        }
      }
    }
  }
`;

import { gql } from '@apollo/client';

export const UPDATE_PAGE_LAYOUT_WIDGET_IS_ACTIVE = gql`
  mutation UpdatePageLayoutWidgetIsActive($id: String!, $isActive: Boolean!) {
    updatePageLayoutWidget(id: $id, input: { isActive: $isActive }) {
      id
      isActive
    }
  }
`;

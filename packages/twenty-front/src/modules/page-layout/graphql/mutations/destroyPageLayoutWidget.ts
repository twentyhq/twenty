import { gql } from '@apollo/client';

export const DESTROY_PAGE_LAYOUT_WIDGET = gql`
  mutation DestroyPageLayoutWidget($id: String!) {
    destroyPageLayoutWidget(id: $id)
  }
`;

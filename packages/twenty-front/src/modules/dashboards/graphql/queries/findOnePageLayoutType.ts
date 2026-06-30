import { gql } from '@apollo/client';

export const FIND_ONE_PAGE_LAYOUT_TYPE = gql`
  query FindOnePageLayoutType($id: String!) {
    getPageLayout(id: $id) {
      id
      type
    }
  }
`;

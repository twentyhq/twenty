import { gql } from '@apollo/client';

export const FIND_ALL_STANDALONE_PAGE_LAYOUTS = gql`
  query FindAllStandalonePageLayouts {
    getPageLayouts(pageLayoutType: STANDALONE_PAGE) {
      id
      name
    }
  }
`;

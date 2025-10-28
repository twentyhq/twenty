import { PAGE_LAYOUT_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_PAGE_LAYOUT = gql`
  ${PAGE_LAYOUT_FRAGMENT}
  query FindOnePageLayout($id: String!) {
    getPageLayout(id: $id) {
      ...PageLayoutFragment
    }
  }
`;

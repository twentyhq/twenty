import { PAGE_LAYOUT_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_PAGE_LAYOUT = gql`
  ${PAGE_LAYOUT_FRAGMENT}
  query FindOnePageLayout($id: String!, $withSoftDeleted: Boolean) {
    getPageLayout(id: $id, withSoftDeleted: $withSoftDeleted) {
      ...PageLayoutFragment
    }
  }
`;

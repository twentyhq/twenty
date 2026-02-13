import { PAGE_LAYOUT_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutFragment';
import { gql } from '@apollo/client';

export const FIND_ALL_RECORD_PAGE_LAYOUTS = gql`
  ${PAGE_LAYOUT_FRAGMENT}
  query FindAllRecordPageLayouts {
    getPageLayouts(pageLayoutType: RECORD_PAGE) {
      ...PageLayoutFragment
    }
  }
`;

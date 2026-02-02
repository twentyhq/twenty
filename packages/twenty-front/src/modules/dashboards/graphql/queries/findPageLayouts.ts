import { PAGE_LAYOUT_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutFragment';
import { gql } from '@apollo/client';

export const FIND_PAGE_LAYOUTS = gql`
  ${PAGE_LAYOUT_FRAGMENT}
  query GetPageLayouts($objectMetadataId: String) {
    getPageLayouts(objectMetadataId: $objectMetadataId) {
      ...PageLayoutFragment
    }
  }
`;

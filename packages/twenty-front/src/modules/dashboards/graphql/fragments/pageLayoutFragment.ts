import { PAGE_LAYOUT_TAB_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutTabFragment';
import { gql } from '@apollo/client';

export const PAGE_LAYOUT_FRAGMENT = gql`
  ${PAGE_LAYOUT_TAB_FRAGMENT}
  fragment PageLayoutFragment on PageLayout {
    id
    name
    objectMetadataId
    type
    tabs {
      ...PageLayoutTabFragment
    }
  }
`;

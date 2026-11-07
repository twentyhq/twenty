import { PAGE_LAYOUT_TAB_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutTabFragment';
import { PAGE_LAYOUT_FILTER_FRAGMENT } from '@/page-layout/graphql/fragments/pageLayoutFilterFragment';
import { gql } from '@apollo/client';

export const PAGE_LAYOUT_FRAGMENT = gql`
  ${PAGE_LAYOUT_TAB_FRAGMENT}
  ${PAGE_LAYOUT_FILTER_FRAGMENT}
  fragment PageLayoutFragment on PageLayout {
    id
    applicationId
    name
    objectMetadataId
    type
    universalIdentifier
    isSystemSideEffect
    isFirstTabPinned
    defaultTabToFocusOnMobileAndSidePanelId
    filters {
      ...PageLayoutFilterFragment
    }
    createdAt
    updatedAt
    tabs {
      ...PageLayoutTabFragment
    }
  }
`;

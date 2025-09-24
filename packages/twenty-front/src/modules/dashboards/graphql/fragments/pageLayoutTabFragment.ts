import { PAGE_LAYOUT_WIDGET_FRAGMENT } from '@/dashboards/graphql/fragments/pageLayoutWidgetFragment';
import { gql } from '@apollo/client';

export const PAGE_LAYOUT_TAB_FRAGMENT = gql`
  ${PAGE_LAYOUT_WIDGET_FRAGMENT}
  fragment PageLayoutTabFragment on PageLayoutTab {
    id
    title
    position
    widgets {
      ...PageLayoutWidgetFragment
    }
    pageLayoutId
  }
`;

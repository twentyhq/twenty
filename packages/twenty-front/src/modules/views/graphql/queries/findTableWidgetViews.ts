import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_TABLE_WIDGET_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindTableWidgetViews($viewTypes: [ViewType!]) {
    getViews(viewTypes: $viewTypes) {
      ...ViewFragment
    }
  }
`;

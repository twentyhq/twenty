import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_FIELDS_WIDGET_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindFieldsWidgetViews($viewTypes: [ViewType!]) {
    getViews(viewTypes: $viewTypes) {
      ...ViewFragment
    }
  }
`;

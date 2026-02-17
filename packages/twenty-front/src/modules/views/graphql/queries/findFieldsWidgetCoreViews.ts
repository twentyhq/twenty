import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_FIELDS_WIDGET_CORE_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindFieldsWidgetCoreViews($viewTypes: [ViewType!]) {
    getCoreViews(viewTypes: $viewTypes) {
      ...ViewFragment
    }
  }
`;

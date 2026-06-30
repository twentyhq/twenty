import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const UPSERT_VIEW_WIDGET = gql`
  ${VIEW_FRAGMENT}
  mutation UpsertViewWidget($input: UpsertViewWidgetInput!) {
    upsertViewWidget(input: $input) {
      ...ViewFragment
    }
  }
`;

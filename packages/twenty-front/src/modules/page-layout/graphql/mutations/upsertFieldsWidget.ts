import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const UPSERT_FIELDS_WIDGET = gql`
  ${VIEW_FRAGMENT}
  mutation UpsertFieldsWidget($input: UpsertFieldsWidgetInput!) {
    upsertFieldsWidget(input: $input) {
      ...ViewFragment
    }
  }
`;

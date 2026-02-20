import { VIEW_FIELD_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFieldGroupFragment';
import { gql } from '@apollo/client';

export const UPSERT_FIELDS_WIDGET = gql`
  ${VIEW_FIELD_GROUP_FRAGMENT}
  mutation UpsertFieldsWidget($input: UpsertFieldsWidgetInput!) {
    upsertFieldsWidget(input: $input) {
      ...ViewFieldGroupFragment
    }
  }
`;

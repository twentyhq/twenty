import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

// ViewFieldFragment comes with VIEW_FRAGMENT
export const UPSERT_VIEW_FIELD_WITH_SCOPE = gql`
  ${VIEW_FRAGMENT}
  mutation UpsertViewFieldWithScope($input: UpsertViewFieldWithScopeInput!) {
    upsertViewFieldWithScope(input: $input) {
      viewField {
        ...ViewFieldFragment
      }
      scopeView {
        ...ViewFragment
      }
    }
  }
`;

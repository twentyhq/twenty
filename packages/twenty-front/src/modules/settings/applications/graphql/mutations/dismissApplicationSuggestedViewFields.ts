import { gql } from '@apollo/client';

export const DISMISS_APPLICATION_SUGGESTED_VIEW_FIELDS = gql`
  mutation DismissApplicationSuggestedViewFields(
    $input: DismissApplicationSuggestedViewFieldsInput!
  ) {
    dismissApplicationSuggestedViewFields(input: $input)
  }
`;

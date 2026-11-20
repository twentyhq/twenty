import { gql } from '@apollo/client';

export const UPDATE_FOCUSED_TAB = gql`
  mutation UpdateFocusedTab($input: UpdateFocusedTabInput!) {
    updateFocusedTab(input: $input)
  }
`;

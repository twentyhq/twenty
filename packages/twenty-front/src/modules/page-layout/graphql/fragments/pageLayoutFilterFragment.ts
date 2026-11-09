import { gql } from '@apollo/client';

export const PAGE_LAYOUT_FILTER_FRAGMENT = gql`
  fragment PageLayoutFilterFragment on PageLayoutFilter {
    id
    label
    type
    position
    defaultValue {
      conditions {
        operand
        value
      }
    }
  }
`;

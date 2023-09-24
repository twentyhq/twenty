import { gql } from '@apollo/client';

export const VIEW_FIELD_FRAGMENT = gql`
  fragment ViewFieldFragment on ViewField {
    index
    isVisible
    key
    name
    size
    viewId
  }
`;

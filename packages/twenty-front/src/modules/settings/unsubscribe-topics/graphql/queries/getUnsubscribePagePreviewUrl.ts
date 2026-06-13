import { gql } from '@apollo/client';

export const GET_UNSUBSCRIBE_PAGE_PREVIEW_URL = gql`
  query UnsubscribePagePreviewUrl {
    unsubscribePagePreviewUrl
  }
`;

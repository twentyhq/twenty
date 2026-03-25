import { gql } from '@apollo/client';

export const TEST_HTTP_REQUEST = gql`
  mutation TestHttpRequest($input: TestHttpRequestInput!) {
    testHttpRequest(input: $input) {
      success
      message
      result
      error
      status
      statusText
      headers
    }
  }
`;

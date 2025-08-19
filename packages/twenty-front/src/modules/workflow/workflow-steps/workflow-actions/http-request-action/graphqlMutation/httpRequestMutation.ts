import { gql } from '@apollo/client';

export const HTTP_REQUEST_MUTATION = gql`
  mutation TestHttpRequest($input: WorkflowHttpRequestActionInputDto!) {
    testHttpRequest(input: $input) {
      status
      statusText
      headers
      data
      error
    }
  }
`;

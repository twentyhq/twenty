import { gql } from '@apollo/client';

export const UPDATE_CODE_STEP_SOURCE = gql`
  mutation UpdateCodeStepSource($input: UpdateCodeStepSourceInput!) {
    updateCodeStepSource(input: $input)
  }
`;

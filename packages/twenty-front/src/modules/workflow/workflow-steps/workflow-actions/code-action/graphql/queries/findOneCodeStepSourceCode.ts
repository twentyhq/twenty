import { gql } from '@apollo/client';

export const FIND_ONE_CODE_STEP_SOURCE_CODE = gql`
  query FindOneCodeStepSourceCode($input: GetCodeStepSourceCodeInput!) {
    getCodeStepSourceCode(input: $input)
  }
`;

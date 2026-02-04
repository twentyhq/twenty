import { gql } from '@apollo/client';

export const UPDATE_LOGIC_FUNCTION_SOURCE = gql`
  mutation UpdateLogicFunctionSource($input: UpdateLogicFunctionSourceInput!) {
    updateLogicFunctionSource(input: $input)
  }
`;

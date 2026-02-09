import { gql } from '@apollo/client';

export const GET_LOGIC_FUNCTION_SOURCE_CODE = gql`
  query GetLogicFunctionSourceCode($input: LogicFunctionIdInput!) {
    getLogicFunctionSourceCode(input: $input)
  }
`;

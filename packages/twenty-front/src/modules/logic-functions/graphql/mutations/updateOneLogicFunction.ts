import { gql } from '@apollo/client';

export const UPDATE_ONE_LOGIC_FUNCTION = gql`
  mutation UpdateOneLogicFunction($input: UpdateLogicFunctionFromSourceInput!) {
    updateOneLogicFunction(input: $input)
  }
`;

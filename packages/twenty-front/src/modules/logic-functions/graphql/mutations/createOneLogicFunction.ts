import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/logic-functions/graphql/fragments/logicFunctionFragment';

export const CREATE_ONE_LOGIC_FUNCTION = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  mutation CreateOneLogicFunction($input: CreateLogicFunctionFromSourceInput!) {
    createOneLogicFunction(input: $input) {
      ...LogicFunctionFields
    }
  }
`;

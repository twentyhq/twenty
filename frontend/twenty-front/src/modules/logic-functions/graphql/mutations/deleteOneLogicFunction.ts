import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/logic-functions/graphql/fragments/logicFunctionFragment';

export const DELETE_ONE_LOGIC_FUNCTION = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  mutation DeleteOneLogicFunction($input: LogicFunctionIdInput!) {
    deleteOneLogicFunction(input: $input) {
      ...LogicFunctionFields
    }
  }
`;

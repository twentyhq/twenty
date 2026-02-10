import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/logic-functions/graphql/fragments/logicFunctionFragment';

export const FIND_ONE_LOGIC_FUNCTION = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  query FindOneLogicFunction($input: LogicFunctionIdInput!) {
    findOneLogicFunction(input: $input) {
      ...LogicFunctionFields
    }
  }
`;

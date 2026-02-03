import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/settings/logic-functions/graphql/fragments/logicFunctionFragment';

export const FIND_ONE_LOGIC_FUNCTION = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  query GetOneLogicFunction($input: LogicFunctionIdInput!) {
    findOneLogicFunction(input: $input) {
      ...LogicFunctionFields
    }
  }
`;

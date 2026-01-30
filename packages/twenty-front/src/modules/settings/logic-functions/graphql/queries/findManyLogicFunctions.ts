import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/settings/logic-functions/graphql/fragments/logicFunctionFragment';

export const FIND_MANY_LOGIC_FUNCTIONS = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  query GetManyLogicFunctions {
    findManyLogicFunctions {
      ...LogicFunctionFields
    }
  }
`;

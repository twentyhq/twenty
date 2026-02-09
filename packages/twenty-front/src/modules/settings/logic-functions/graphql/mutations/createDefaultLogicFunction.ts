import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/settings/logic-functions/graphql/fragments/logicFunctionFragment';

export const CREATE_DEFAULT_LOGIC_FUNCTION = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  mutation CreateDefaultLogicFunctionItem(
    $input: CreateDefaultLogicFunctionInput!
  ) {
    createDefaultLogicFunction(input: $input) {
      ...LogicFunctionFields
    }
  }
`;

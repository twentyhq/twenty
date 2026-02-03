import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/settings/logic-functions/graphql/fragments/logicFunctionFragment';

export const UPDATE_ONE_LOGIC_FUNCTION = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  mutation UpdateOneLogicFunction($input: UpdateLogicFunctionInput!) {
    updateOneLogicFunction(input: $input) {
      ...LogicFunctionFields
    }
  }
`;

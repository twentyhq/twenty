import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/settings/logic-functions/graphql/fragments/logicFunctionFragment';

export const CREATE_ONE_LOGIC_FUNCTION = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  mutation CreateOneLogicFunctionItem($input: CreateLogicFunctionInput!) {
    createOneLogicFunction(input: $input) {
      ...LogicFunctionFields
    }
  }
`;

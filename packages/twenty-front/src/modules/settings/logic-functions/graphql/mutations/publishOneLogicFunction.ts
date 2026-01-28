import { gql } from '@apollo/client';
import { LOGIC_FUNCTION_FRAGMENT } from '@/settings/logic-functions/graphql/fragments/logicFunctionFragment';

export const PUBLISH_ONE_LOGIC_FUNCTION = gql`
  ${LOGIC_FUNCTION_FRAGMENT}
  mutation PublishOneLogicFunction($input: PublishLogicFunctionInput!) {
    publishLogicFunction(input: $input) {
      ...LogicFunctionFields
    }
  }
`;

import { gql } from '@apollo/client';

export const LOGIC_FUNCTION_FRAGMENT = gql`
  fragment LogicFunctionFields on LogicFunction {
    id
    name
    description
    runtime
    timeoutSeconds
    sourceHandlerPath
    builtHandlerPath
    handlerName
    toolInputSchema
    isTool
    applicationId
    createdAt
    updatedAt
  }
`;

import { gql } from '@apollo/client';

export const LOGIC_FUNCTION_FRAGMENT = gql`
  fragment LogicFunctionFields on LogicFunction {
    id
    name
    description
    runtime
    timeoutSeconds
    sourceHandlerPath
    handlerName
    cronTriggerSettings
    databaseEventTriggerSettings
    httpRouteTriggerSettings
    toolTriggerSettings
    workflowActionTriggerSettings
    applicationId
    universalIdentifier
    createdAt
    updatedAt
  }
`;

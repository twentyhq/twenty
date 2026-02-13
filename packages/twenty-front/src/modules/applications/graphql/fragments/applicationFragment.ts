import { AGENT_FRAGMENT } from '@/ai/graphql/fragments/agentFragment';
import { OBJECT_METADATA_FRAGMENT } from '@/object-metadata/graphql/fragment';
import { LOGIC_FUNCTION_FRAGMENT } from '@/logic-functions/graphql/fragments/logicFunctionFragment';
import { gql } from '@apollo/client';

export const APPLICATION_FRAGMENT = gql`
  ${AGENT_FRAGMENT}
  ${LOGIC_FUNCTION_FRAGMENT}
  ${OBJECT_METADATA_FRAGMENT}
  fragment ApplicationFields on Application {
    id
    name
    description
    version
    universalIdentifier
    canBeUninstalled
    defaultRoleId
    availablePackages
    applicationVariables {
      id
      key
      value
      description
      isSecret
    }
    agents {
      ...AgentFields
    }
    objects {
      ...ObjectMetadataFields
    }
    logicFunctions {
      ...LogicFunctionFields
    }
  }
`;

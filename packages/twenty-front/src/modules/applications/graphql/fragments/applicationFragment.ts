import { gql } from '@apollo/client';
import { AGENT_FRAGMENT } from '@/ai/graphql/fragments/agentFragment';
import { LOGIC_FUNCTION_FRAGMENT } from '@/settings/logic-functions/graphql/fragments/logicFunctionFragment';
import { OBJECT_METADATA_FRAGMENT } from '@/object-metadata/graphql/fragment';

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

import { gql } from '@apollo/client';
import { AGENT_FRAGMENT } from '@/ai/graphql/fragments/agentFragment';
import { SERVERLESS_FUNCTION_FRAGMENT } from '@/settings/serverless-functions/graphql/fragments/serverlessFunctionFragment';
import { OBJECT_METADATA_FRAGMENT } from '@/object-metadata/graphql/fragment';

export const APPLICATION_FRAGMENT = gql`
  ${AGENT_FRAGMENT}
  ${SERVERLESS_FUNCTION_FRAGMENT}
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
    serverlessFunctions {
      ...ServerlessFunctionFields
    }
  }
`;

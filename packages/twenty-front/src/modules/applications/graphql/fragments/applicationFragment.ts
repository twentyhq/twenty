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
    logo
    version
    universalIdentifier
    applicationRegistrationId
    applicationRegistration {
      id
      latestAvailableVersion
      sourceType
      logoUrl
    }
    canBeUninstalled
    defaultRoleId
    settingsCustomTabFrontComponentId
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
    frontComponents {
      id
      name
      description
      applicationId
      componentName
      builtComponentChecksum
      universalIdentifier
      isHeadless
      usesSdkClient
      createdAt
      updatedAt
    }
    commandMenuItems {
      id
      label
      shortLabel
      icon
      isPinned
      availabilityType
      conditionalAvailabilityExpression
      frontComponentId
      universalIdentifier
      applicationId
      createdAt
      updatedAt
    }
    objects {
      ...ObjectMetadataFields
    }
    logicFunctions {
      ...LogicFunctionFields
    }
  }
`;

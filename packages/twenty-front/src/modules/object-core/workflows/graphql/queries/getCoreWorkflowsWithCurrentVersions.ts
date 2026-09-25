import { gql } from '@apollo/client';

export const GET_CORE_WORKFLOWS_WITH_CURRENT_VERSIONS = gql`
  query GetCoreWorkflowsWithCurrentVersions(
    $input: CoreWorkflowsWithCurrentVersionsInput!
  ) {
    coreWorkflowsWithCurrentVersions(input: $input) {
      workflow {
        id
        name
        statuses
        lastPublishedCoreWorkflowVersionId
      }
      versions {
        id
        coreWorkflowId
        label
        status
        createdAt
      }
      currentVersion {
        id
        coreWorkflowId
        label
        status
        trigger
        steps
        createdAt
        updatedAt
      }
    }
  }
`;

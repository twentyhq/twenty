import { gql } from '@apollo/client';

export const PREPARE_GETTING_STARTED_HANDOVER = gql`
  mutation PrepareGettingStartedHandover($activate: Boolean!) {
    prepareGettingStartedHandover(activate: $activate) {
      workflowId
      versionId
    }
  }
`;

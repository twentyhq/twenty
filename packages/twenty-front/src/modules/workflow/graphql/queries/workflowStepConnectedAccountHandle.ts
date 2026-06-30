import { gql } from '@apollo/client';

export const WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE = gql`
  query WorkflowStepConnectedAccountHandle($connectedAccountId: UUID!) {
    workflowStepConnectedAccountHandle(
      connectedAccountId: $connectedAccountId
    ) {
      id
      handle
      provider
    }
  }
`;

import { gql } from '@apollo/client';

export const GETTING_STARTED_WORKFLOW_PREVIEWS = gql`
  query GettingStartedWorkflowPreviews {
    gettingStartedWorkflowPreviews {
      step
      trigger {
        type
        databaseEventAction
        title
      }
      actions {
        type
        title
      }
    }
  }
`;

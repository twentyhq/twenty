import { gql } from '@apollo/client';

export const GETTING_STARTED_WORKFLOW_PREVIEWS = gql`
  query GettingStartedWorkflowPreviews {
    gettingStartedWorkflowPreviews {
      stepActionKey
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

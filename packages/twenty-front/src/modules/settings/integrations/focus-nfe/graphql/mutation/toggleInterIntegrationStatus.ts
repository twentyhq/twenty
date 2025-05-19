import { gql } from '@apollo/client';

export const TOGGLE_FOCUSNFE_INTEGRATION_STATUS = gql`
  mutation ToggleFocusNfeIntegrationStatus($focusNfeIntegrationId: String!) {
    toggleFocusNfeIntegrationStatus(
      focusNfeIntegrationId: $focusNfeIntegrationId
    )
  }
`;

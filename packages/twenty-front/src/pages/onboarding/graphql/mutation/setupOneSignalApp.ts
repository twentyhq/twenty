import { gql } from '@apollo/client';

export const SETUP_ONESIGNAL_APP = gql`
  mutation SetupOneSignalApp {
    setupOneSignalApp {
      id
      onesignalAppId
      onesignalApiKey
    }
  }
`;

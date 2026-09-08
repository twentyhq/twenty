import { gql } from '@apollo/client';

export const DESKTOP_RECORDER_SETUP = gql`
  query DesktopRecorderSetup {
    desktopRecorderSetup {
      installed
      downloadUrl
    }
  }
`;

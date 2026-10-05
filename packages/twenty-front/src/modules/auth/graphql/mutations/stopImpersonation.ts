import { gql } from '@apollo/client';

export const STOP_IMPERSONATION = gql`
  mutation StopImpersonation {
    stopImpersonation {
      canRestoreImpersonatorSession
    }
  }
`;

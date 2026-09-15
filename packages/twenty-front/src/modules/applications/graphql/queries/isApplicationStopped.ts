import { gql } from '@apollo/client';

export const IS_APPLICATION_STOPPED = gql`
  query IsApplicationStopped($applicationUniversalIdentifier: String!) {
    isApplicationStopped(
      applicationUniversalIdentifier: $applicationUniversalIdentifier
    )
  }
`;

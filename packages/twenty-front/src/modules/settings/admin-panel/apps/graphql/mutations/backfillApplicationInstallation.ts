import { gql } from '@apollo/client';

export const BACKFILL_APPLICATION_INSTALLATION = gql`
  mutation BackfillApplicationInstallation(
    $applicationRegistrationId: String!
  ) {
    backfillApplicationInstallation(
      applicationRegistrationId: $applicationRegistrationId
    )
  }
`;

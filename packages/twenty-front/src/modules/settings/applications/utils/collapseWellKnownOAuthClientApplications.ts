import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import {
  type ApplicationRegistrationSummary,
  type WellKnownOAuthClient,
} from '~/generated-metadata/graphql';

// One row per well-known client, preferably its seeded install over earlier per-connection ones
export const collapseWellKnownOAuthClientApplications = <
  TApplication extends {
    universalIdentifier?: string | null;
    applicationRegistration?: Pick<
      ApplicationRegistrationSummary,
      'wellKnownOAuthClient'
    > | null;
  },
>(
  applications: TApplication[],
): TApplication[] => {
  const representativeByWellKnownOAuthClient = new Map<
    WellKnownOAuthClient,
    TApplication
  >();

  for (const application of applications) {
    const wellKnownOAuthClient =
      application.applicationRegistration?.wellKnownOAuthClient;

    if (!isDefined(wellKnownOAuthClient)) {
      continue;
    }

    const isSeededInstall =
      application.universalIdentifier ===
      WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS[wellKnownOAuthClient];

    if (
      isSeededInstall ||
      !representativeByWellKnownOAuthClient.has(wellKnownOAuthClient)
    ) {
      representativeByWellKnownOAuthClient.set(
        wellKnownOAuthClient,
        application,
      );
    }
  }

  return applications.filter((application) => {
    const wellKnownOAuthClient =
      application.applicationRegistration?.wellKnownOAuthClient;

    return (
      !isDefined(wellKnownOAuthClient) ||
      representativeByWellKnownOAuthClient.get(wellKnownOAuthClient) ===
        application
    );
  });
};

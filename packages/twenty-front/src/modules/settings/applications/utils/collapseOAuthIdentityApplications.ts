import { isDefined } from 'twenty-shared/utils';
import { type ApplicationRegistrationSummary } from '~/generated-metadata/graphql';

export const collapseOAuthIdentityApplications = <
  TApplication extends {
    universalIdentifier?: string | null;
    applicationRegistration?: Pick<
      ApplicationRegistrationSummary,
      'oAuthIdentityUniversalIdentifier'
    > | null;
  },
>(
  applications: TApplication[],
): TApplication[] => {
  const representativeByOAuthIdentity = new Map<string, TApplication>();

  for (const application of applications) {
    const oAuthIdentityUniversalIdentifier =
      application.applicationRegistration?.oAuthIdentityUniversalIdentifier;

    if (!isDefined(oAuthIdentityUniversalIdentifier)) {
      continue;
    }

    const isAppInstall =
      application.universalIdentifier === oAuthIdentityUniversalIdentifier;

    if (
      isAppInstall ||
      !representativeByOAuthIdentity.has(oAuthIdentityUniversalIdentifier)
    ) {
      representativeByOAuthIdentity.set(
        oAuthIdentityUniversalIdentifier,
        application,
      );
    }
  }

  return applications.filter((application) => {
    const oAuthIdentityUniversalIdentifier =
      application.applicationRegistration?.oAuthIdentityUniversalIdentifier;

    return (
      !isDefined(oAuthIdentityUniversalIdentifier) ||
      representativeByOAuthIdentity.get(oAuthIdentityUniversalIdentifier) ===
        application
    );
  });
};

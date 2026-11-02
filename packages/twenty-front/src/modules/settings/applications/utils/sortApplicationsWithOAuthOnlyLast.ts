import {
  type ApplicationRegistrationSummary,
  ApplicationRegistrationSourceType,
} from '~/generated-metadata/graphql';

export const sortApplicationsWithOAuthOnlyLast = <
  TApplication extends {
    applicationRegistration?: Pick<
      ApplicationRegistrationSummary,
      'sourceType'
    > | null;
  },
>(
  applications: TApplication[],
): TApplication[] =>
  [...applications].sort((firstApplication, secondApplication) => {
    const isFirstApplicationOAuthOnly =
      firstApplication.applicationRegistration?.sourceType ===
      ApplicationRegistrationSourceType.OAUTH_ONLY;
    const isSecondApplicationOAuthOnly =
      secondApplication.applicationRegistration?.sourceType ===
      ApplicationRegistrationSourceType.OAUTH_ONLY;

    if (isFirstApplicationOAuthOnly === isSecondApplicationOAuthOnly) {
      return 0;
    }

    return isFirstApplicationOAuthOnly ? 1 : -1;
  });

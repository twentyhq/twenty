import {
  type Application,
  ApplicationRegistrationSourceType,
} from '~/generated-metadata/graphql';

export const sortApplicationsWithOAuthOnlyLast = <
  TApplication extends Partial<Pick<Application, 'sourceType'>>,
>(
  applications: TApplication[],
): TApplication[] =>
  [...applications].sort((firstApplication, secondApplication) => {
    const isFirstApplicationOAuthOnly =
      firstApplication.sourceType ===
      ApplicationRegistrationSourceType.OAUTH_ONLY;
    const isSecondApplicationOAuthOnly =
      secondApplication.sourceType ===
      ApplicationRegistrationSourceType.OAUTH_ONLY;

    if (isFirstApplicationOAuthOnly === isSecondApplicationOAuthOnly) {
      return 0;
    }

    return isFirstApplicationOAuthOnly ? 1 : -1;
  });

import { isOAuthOnlyApplication } from '@/settings/applications/utils/isOAuthOnlyApplication';

export const sortApplicationsWithOAuthOnlyLast = <
  TApplication extends Parameters<typeof isOAuthOnlyApplication>[0],
>(
  applications: TApplication[],
): TApplication[] =>
  [...applications].sort((firstApplication, secondApplication) => {
    const isFirstApplicationOAuthOnly =
      isOAuthOnlyApplication(firstApplication);
    const isSecondApplicationOAuthOnly =
      isOAuthOnlyApplication(secondApplication);

    if (isFirstApplicationOAuthOnly === isSecondApplicationOAuthOnly) {
      return 0;
    }

    return isFirstApplicationOAuthOnly ? 1 : -1;
  });

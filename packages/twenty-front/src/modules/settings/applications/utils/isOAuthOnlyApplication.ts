import {
  type ApplicationRegistrationSummary,
  ApplicationRegistrationSourceType,
} from '~/generated-metadata/graphql';

export const isOAuthOnlyApplication = (application: {
  applicationRegistration?: Pick<
    ApplicationRegistrationSummary,
    'sourceType'
  > | null;
}): boolean =>
  application.applicationRegistration?.sourceType ===
  ApplicationRegistrationSourceType.OAUTH_ONLY;

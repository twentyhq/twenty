import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

export const isOAuthOnlyApplicationSourceType = (
  sourceType: ApplicationRegistrationSourceType | null | undefined,
): boolean => sourceType === ApplicationRegistrationSourceType.OAUTH_ONLY;

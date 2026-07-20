import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

export const isUpgradableApplicationSourceType = (
  sourceType: ApplicationRegistrationSourceType | null | undefined,
): boolean =>
  sourceType === ApplicationRegistrationSourceType.NPM ||
  sourceType === ApplicationRegistrationSourceType.TARBALL;

import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

// NPM apps get new versions from the registry, TARBALL apps from a re-deployed
// tarball; LOCAL apps are updated by dev sync and OAUTH_ONLY registrations
// have no code artifacts.
export const isUpgradableApplicationSourceType = (
  sourceType: ApplicationRegistrationSourceType | null | undefined,
): boolean =>
  sourceType === ApplicationRegistrationSourceType.NPM ||
  sourceType === ApplicationRegistrationSourceType.TARBALL;

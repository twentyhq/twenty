import { isNonEmptyString } from '@sniptt/guards';

const TWENTY_APPLICATION_PACKAGE_SCOPE = '@twentyhq/';

export const isTwentyApplicationPackage = (
  sourcePackage: string | null | undefined,
): boolean =>
  isNonEmptyString(sourcePackage) &&
  sourcePackage.startsWith(TWENTY_APPLICATION_PACKAGE_SCOPE);

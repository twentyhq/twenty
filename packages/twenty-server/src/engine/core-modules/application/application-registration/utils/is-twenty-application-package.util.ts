import { isNonEmptyString } from '@sniptt/guards';

const TWENTY_APPLICATION_PACKAGE_SCOPE = '@twentyhq/';

// The npm scope is the one provenance signal a third party cannot declare in a manifest
export const isTwentyApplicationPackage = (
  sourcePackage: string | null | undefined,
): boolean =>
  isNonEmptyString(sourcePackage) &&
  sourcePackage.startsWith(TWENTY_APPLICATION_PACKAGE_SCOPE);

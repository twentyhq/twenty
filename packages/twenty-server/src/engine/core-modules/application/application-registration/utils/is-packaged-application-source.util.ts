import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

// Packaged sources ship an immutable build artifact, unlike local (edited
// during development) and oauth-only (no code artifact at all).
export const PACKAGED_APPLICATION_SOURCE_TYPES: ApplicationRegistrationSourceType[] =
  [
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.NPM,
  ];

export const isPackagedApplicationSource = (
  sourceType: ApplicationRegistrationSourceType,
): boolean => PACKAGED_APPLICATION_SOURCE_TYPES.includes(sourceType);

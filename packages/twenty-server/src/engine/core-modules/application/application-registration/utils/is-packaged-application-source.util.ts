import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export const isPackagedApplicationSource = (
  sourceType: ApplicationRegistrationSourceType,
): boolean =>
  sourceType === ApplicationRegistrationSourceType.TARBALL ||
  sourceType === ApplicationRegistrationSourceType.NPM;

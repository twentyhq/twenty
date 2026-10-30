import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const isTwentyStandardApplication = (
  application: Pick<FlatApplication, 'universalIdentifier'>,
): boolean =>
  application.universalIdentifier ===
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { assertUnreachable } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type ExportableFlatApplicationProperties = Pick<
  FlatApplication,
  'universalIdentifier' | 'name' | 'sourceType'
>;

export const assertFlatApplicationIsExportable = (
  flatApplication: ExportableFlatApplicationProperties,
): void => {
  if (
    flatApplication.universalIdentifier ===
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
  ) {
    throw new ApplicationException(
      'The standard application is owned by the engine and cannot be exported',
      ApplicationExceptionCode.STANDARD_APPLICATION_NOT_EXPORTABLE,
    );
  }

  switch (flatApplication.sourceType) {
    case ApplicationRegistrationSourceType.LOCAL:
      return;
    case ApplicationRegistrationSourceType.NPM:
    case ApplicationRegistrationSourceType.TARBALL:
      throw new ApplicationException(
        `Application "${flatApplication.name}" was installed from a ${flatApplication.sourceType} package and cannot be exported. Its published version can be reinstalled with app:install.`,
        ApplicationExceptionCode.APPLICATION_NOT_EXPORTABLE,
      );
    case ApplicationRegistrationSourceType.OAUTH_ONLY:
      throw new ApplicationException(
        `Application "${flatApplication.name}" is an OAuth registration without metadata and cannot be exported`,
        ApplicationExceptionCode.APPLICATION_NOT_EXPORTABLE,
      );
    default:
      return assertUnreachable(flatApplication.sourceType);
  }
};

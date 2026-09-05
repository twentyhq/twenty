import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import {
  assertFlatApplicationIsExportable,
  type ExportableFlatApplicationProperties,
} from 'src/engine/core-modules/application/application-manifest/utils/assert-flat-application-is-exportable.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';

const buildFlatApplication = (
  overrides: Partial<ExportableFlatApplicationProperties>,
): ExportableFlatApplicationProperties => ({
  universalIdentifier: 'application-universal-identifier',
  name: 'Ticketing',
  sourceType: ApplicationRegistrationSourceType.LOCAL,
  ...overrides,
});

describe('assertFlatApplicationIsExportable', () => {
  it('should accept a local application', () => {
    expect(() =>
      assertFlatApplicationIsExportable(buildFlatApplication({})),
    ).not.toThrow();
  });

  it('should refuse the standard application', () => {
    expect(() =>
      assertFlatApplicationIsExportable(
        buildFlatApplication({
          universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ),
    ).toThrow(
      expect.objectContaining({
        code: ApplicationExceptionCode.STANDARD_APPLICATION_NOT_EXPORTABLE,
      }),
    );
  });

  it.each([
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.OAUTH_ONLY,
  ])('should refuse a %s application', (sourceType) => {
    expect(() =>
      assertFlatApplicationIsExportable(buildFlatApplication({ sourceType })),
    ).toThrow(
      expect.objectContaining({
        code: ApplicationExceptionCode.APPLICATION_NOT_EXPORTABLE,
      }),
    );
  });

  it('should point a packaged application at app:install', () => {
    expect(() =>
      assertFlatApplicationIsExportable(
        buildFlatApplication({
          sourceType: ApplicationRegistrationSourceType.NPM,
        }),
      ),
    ).toThrow(/app:install/);
  });
});

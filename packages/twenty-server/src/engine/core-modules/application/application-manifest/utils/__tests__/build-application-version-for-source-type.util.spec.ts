import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  LOCAL_APPLICATION_VERSION_SUFFIX,
  buildApplicationVersionForSourceType,
} from 'src/engine/core-modules/application/application-manifest/utils/build-application-version-for-source-type.util';

describe('buildApplicationVersionForSourceType', () => {
  it('should tag a local dev apply version as detached', () => {
    expect(
      buildApplicationVersionForSourceType({
        packageJsonVersion: '1.2.3',
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
    ).toBe(`1.2.3 ${LOCAL_APPLICATION_VERSION_SUFFIX}`);
  });

  it('should keep the plain version for npm installs', () => {
    expect(
      buildApplicationVersionForSourceType({
        packageJsonVersion: '1.2.3',
        sourceType: ApplicationRegistrationSourceType.NPM,
      }),
    ).toBe('1.2.3');
  });

  it('should keep the plain version for tarball installs', () => {
    expect(
      buildApplicationVersionForSourceType({
        packageJsonVersion: '1.2.3',
        sourceType: ApplicationRegistrationSourceType.TARBALL,
      }),
    ).toBe('1.2.3');
  });

  it('should not tag a missing version', () => {
    expect(
      buildApplicationVersionForSourceType({
        packageJsonVersion: undefined,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
    ).toBeUndefined();

    expect(
      buildApplicationVersionForSourceType({
        packageJsonVersion: null,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
    ).toBeNull();
  });
});

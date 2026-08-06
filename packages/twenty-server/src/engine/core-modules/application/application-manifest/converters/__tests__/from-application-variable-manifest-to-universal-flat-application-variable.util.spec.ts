import { fromApplicationVariableManifestToUniversalFlatApplicationVariable } from 'src/engine/core-modules/application/application-manifest/converters/from-application-variable-manifest-to-universal-flat-application-variable.util';

describe('fromApplicationVariableManifestToUniversalFlatApplicationVariable', () => {
  const now = '2026-01-01T00:00:00.000Z';

  const convert = (isDeprecated?: boolean) =>
    fromApplicationVariableManifestToUniversalFlatApplicationVariable({
      key: 'API_KEY',
      universalIdentifier: 'variable-uuid-1',
      encryptedValue: '',
      isDeprecated,
      applicationUniversalIdentifier: 'app-uuid-1',
      now,
    });

  it('should default isDeprecated to false when the manifest omits it', () => {
    expect(convert().isDeprecated).toBe(false);
  });

  it('should pass isDeprecated through', () => {
    expect(convert(true).isDeprecated).toBe(true);
  });
});

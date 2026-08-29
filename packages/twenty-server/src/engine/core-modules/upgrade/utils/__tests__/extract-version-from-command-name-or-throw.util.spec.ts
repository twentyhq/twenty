import { extractVersionFromCommandNameOrThrow } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name-or-throw.util';

describe('extractVersionFromCommandNameOrThrow', () => {
  it('should extract version from standard command name', () => {
    expect(
      extractVersionFromCommandNameOrThrow(
        '1.21.0_BackfillDatasourceCommand_1775500003000',
      ),
    ).toBe('1.21.0');
  });

  it('should extract version with different version numbers', () => {
    expect(
      extractVersionFromCommandNameOrThrow('1.22.0_SomeCommand_1780000001000'),
    ).toBe('1.22.0');
  });

  it('should throw for names without underscores', () => {
    expect(() => extractVersionFromCommandNameOrThrow('nounderscores')).toThrow(
      'does not carry a version prefix',
    );
  });

  it('should throw for an empty string', () => {
    expect(() => extractVersionFromCommandNameOrThrow('')).toThrow(
      'does not carry a version prefix',
    );
  });
});

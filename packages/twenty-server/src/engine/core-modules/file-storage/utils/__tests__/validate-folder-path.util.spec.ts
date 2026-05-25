import { validateFolderPath } from 'src/engine/core-modules/file-storage/utils/validate-folder-path.util';

describe('validateFolderPath', () => {
  it.each([
    { title: 'simple folder name', folderPath: 'my-folder' },
    {
      title: 'UUID folder',
      folderPath: '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58',
    },
    { title: 'nested folder path', folderPath: '0000-0999/tmp200/toto' },
    { title: 'dot-prefixed hidden folder', folderPath: '.hidden' },
  ])('should return isValid: true for $title', ({ folderPath }) => {
    expect(validateFolderPath({ folderPath })).toEqual({ isValid: true });
  });

  it('should fail on path traversal', () => {
    const result = validateFolderPath({
      folderPath: '../../../other-ws/other-app/folder',
    });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('path traversal');
    }
  });

  it('should fail on absolute path', () => {
    const result = validateFolderPath({ folderPath: '/etc/secret-folder' });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('must be relative');
    }
  });

  it('should fail on empty folder path', () => {
    const result = validateFolderPath({ folderPath: '' });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('must not be empty');
    }
  });

  it('should fail on invalid characters (spaces)', () => {
    const result = validateFolderPath({ folderPath: 'my folder/data' });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('invalid characters');
    }
  });

  it('should fail on shell metacharacters', () => {
    const result = validateFolderPath({ folderPath: 'folder;rm -rf' });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('invalid characters');
    }
  });

  it.each([
    { title: 'trailing slash', folderPath: 'my-folder/' },
    { title: 'double slashes', folderPath: 'my-folder//sub' },
  ])('should fail on $title', ({ folderPath }) => {
    const result = validateFolderPath({ folderPath });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('empty segments or trailing slashes');
    }
  });

  it.each([
    { title: '.mjs extension', folderPath: 'src/logic-functions/handler.mjs' },
    { title: '.ts extension', folderPath: 'src/components/index.ts' },
    { title: '.json extension', folderPath: 'config/settings.json' },
    { title: '.woff2 extension', folderPath: 'fonts/roboto.woff2' },
    { title: '.pdf extension', folderPath: 'docs/report.pdf' },
    { title: '.csv extension', folderPath: 'data/export.csv' },
    { title: 'numeric-only extension (.7z)', folderPath: 'archive.7z' },
    { title: 'dotted version string (v1.0.0)', folderPath: 'v1.0.0' },
    { title: 'numeric extension (.123)', folderPath: 'release.123' },
  ])('should fail on path with file extension ($title)', ({ folderPath }) => {
    const result = validateFolderPath({ folderPath });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('file extension');
    }
  });

  it('should short-circuit on the first failure', () => {
    const result = validateFolderPath({
      folderPath: '../../../handler.mjs',
    });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toContain('path traversal');
    }
  });
});

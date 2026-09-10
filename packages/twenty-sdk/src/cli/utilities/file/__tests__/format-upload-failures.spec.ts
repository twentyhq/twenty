import { formatUploadFailures } from '@/cli/utilities/file/format-upload-failures';
import { describe, expect, it } from 'vitest';

describe('formatUploadFailures', () => {
  it('should keep the one-line form for a failure with its own message', () => {
    expect(
      formatUploadFailures([
        { builtPath: '.twenty/output/src/a.mjs', error: 'too large' },
      ]),
    ).toEqual(['Failed to upload .twenty/output/src/a.mjs: too large']);
  });

  it('should collapse failures sharing a message into a count followed by their paths', () => {
    expect(
      formatUploadFailures([
        {
          builtPath: '.twenty/output/src/a.mjs',
          error: 'size must not be less than 1',
        },
        {
          builtPath: '.twenty/output/src/b.mjs',
          error: 'size must not be less than 1',
        },
        {
          builtPath: '.twenty/output/yarn.lock',
          error: 'size must not be less than 1',
        },
      ]),
    ).toEqual([
      'Failed to upload 3 files: size must not be less than 1',
      '  .twenty/output/src/a.mjs',
      '  .twenty/output/src/b.mjs',
      '  .twenty/output/yarn.lock',
    ]);
  });

  it('should keep failures with distinct messages apart', () => {
    expect(
      formatUploadFailures([
        { builtPath: '.twenty/output/src/a.mjs', error: 'too large' },
        { builtPath: '.twenty/output/src/b.mjs', error: 'expired' },
        { builtPath: '.twenty/output/src/c.mjs', error: 'too large' },
      ]),
    ).toEqual([
      'Failed to upload 2 files: too large',
      '  .twenty/output/src/a.mjs',
      '  .twenty/output/src/c.mjs',
      'Failed to upload .twenty/output/src/b.mjs: expired',
    ]);
  });

  it('should return nothing for no failures', () => {
    expect(formatUploadFailures([])).toEqual([]);
  });
});

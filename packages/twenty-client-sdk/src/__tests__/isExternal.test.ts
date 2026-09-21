import { describe, expect, it } from 'vitest';

import { isExternal } from '../../vite.shared';

describe('isExternal', () => {
  it.each([
    'crypto',
    'node:crypto',
    'zlib',
    'node:zlib',
    'stream',
    'node:stream',
    'child_process',
    'node:child_process',
    'node:fs',
    'node:fs/promises',
    'node:path',
  ])('externalizes the Node builtin "%s"', (builtin) => {
    expect(isExternal(builtin)).toBe(true);
  });

  it('externalizes declared dependencies and their subpaths', () => {
    expect(isExternal('graphql')).toBe(true);
    expect(isExternal('lodash')).toBe(true);
    expect(isExternal('lodash/merge')).toBe(true);
  });

  it('does not externalize twenty-shared or app source', () => {
    expect(isExternal('twenty-shared')).toBe(false);
    expect(isExternal('@/core/index')).toBe(false);
    expect(isExternal('some-unbundled-package')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { getGranolaKeyType } from 'src/front-components/utils/get-granola-key-type.util';

describe('getGranolaKeyType', () => {
  it('recognizes a workspace key from its endpoint scope', () => {
    expect(getGranolaKeyType(['workspace'])).toBe('workspace');
  });

  it('treats personal and public scopes as a personal key', () => {
    expect(getGranolaKeyType(['personal', 'public'])).toBe('personal');
  });
});

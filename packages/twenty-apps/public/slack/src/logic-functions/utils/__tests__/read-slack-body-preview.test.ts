import { describe, expect, it } from 'vitest';

import { readSlackBodyPreview } from 'src/logic-functions/utils/read-slack-body-preview';

describe('readSlackBodyPreview', () => {
  it('should read the markdown body', () => {
    expect(readSlackBodyPreview({ markdown: '  Call them back  ' })).toBe(
      'Call them back',
    );
  });

  it('should truncate a long body', () => {
    const preview = readSlackBodyPreview({ markdown: 'a'.repeat(400) });

    expect(preview).toBe(`${'a'.repeat(300)}…`);
  });

  it('should count astral characters as single code points', () => {
    const preview = readSlackBodyPreview({ markdown: '👍'.repeat(400) });

    expect(preview).toBe(`${'👍'.repeat(300)}…`);
  });

  it.each([undefined, {}, { markdown: '   ' }, { markdown: 42 }])(
    'should return undefined for %s',
    (bodyValue) => {
      expect(readSlackBodyPreview(bodyValue)).toBeUndefined();
    },
  );
});

import { describe, expect, it } from 'vitest';

import { readSlackBodyPreview } from 'src/logic-functions/utils/read-slack-body-preview';

describe('readSlackBodyPreview', () => {
  it('should read the markdown body', () => {
    expect(
      readSlackBodyPreview({ bodyValue: { markdown: '  Call them back  ' } }),
    ).toBe('Call them back');
  });

  it('should truncate a long body', () => {
    const preview = readSlackBodyPreview({
      bodyValue: { markdown: 'a'.repeat(400) },
    });

    expect(preview).toBe(`${'a'.repeat(299)}…`);
  });

  it('should keep composite emoji whole when truncating', () => {
    const preview = readSlackBodyPreview({
      bodyValue: { markdown: '👨‍👩‍👧‍👦'.repeat(400) },
    });

    expect(preview).toBe(`${'👨‍👩‍👧‍👦'.repeat(27)}…`);
  });

  it('should keep a truncated emoji body within the maximum length', () => {
    const preview = readSlackBodyPreview({
      bodyValue: { markdown: '👨‍👩‍👧‍👦'.repeat(400) },
      maxLength: 3000,
    });

    expect(preview?.length).toBeLessThanOrEqual(3000);
  });

  it('should honour a larger maximum length', () => {
    const preview = readSlackBodyPreview({
      bodyValue: { markdown: 'a'.repeat(400) },
      maxLength: 3000,
    });

    expect(preview).toBe('a'.repeat(400));
  });

  it.each([undefined, {}, { markdown: '   ' }, { markdown: 42 }])(
    'should return undefined for %s',
    (bodyValue) => {
      expect(readSlackBodyPreview({ bodyValue })).toBeUndefined();
    },
  );

  it('should count the ellipsis inside the maximum length', () => {
    const preview = readSlackBodyPreview({
      bodyValue: { markdown: 'a'.repeat(5000) },
      maxLength: 3000,
    });

    expect(preview).toBe(`${'a'.repeat(2999)}…`);
  });
});

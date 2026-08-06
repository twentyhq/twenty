import { describe, expect, it } from 'vitest';

import { normalizeSlackParentMessageTimestamp } from 'src/logic-functions/utils/normalize-slack-parent-message-timestamp';

describe('normalizeSlackParentMessageTimestamp', () => {
  it('should return the trimmed timestamp', () => {
    expect(normalizeSlackParentMessageTimestamp('  1700000000.000100  ')).toBe(
      '1700000000.000100',
    );
  });

  it('should return undefined when the timestamp is missing', () => {
    expect(normalizeSlackParentMessageTimestamp(undefined)).toBeUndefined();
  });

  it('should return undefined when the timestamp is blank', () => {
    expect(normalizeSlackParentMessageTimestamp('   ')).toBeUndefined();
  });

  it('should return undefined for a runtime non-string timestamp', () => {
    expect(
      normalizeSlackParentMessageTimestamp(1700000000 as unknown as string),
    ).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { buildRevokedMessageText } from 'src/logic-functions/data/build-revoked-message-text.util';

const REVOKED_AT = new Date('2026-11-20T10:00:00.000Z');

describe('buildRevokedMessageText', () => {
  it('should append the deletion note to the original text', () => {
    expect(buildRevokedMessageText({ originalText: 'Hello', revokedAt: REVOKED_AT })).toBe(
      'Hello\n\n(Deleted on 2026-11-20T10:00:00.000Z)',
    );
  });

  it('should not add the note twice when the revoke is delivered again', () => {
    const revokedText = buildRevokedMessageText({ originalText: 'Hello', revokedAt: REVOKED_AT });

    expect(buildRevokedMessageText({ originalText: revokedText, revokedAt: REVOKED_AT })).toBe(revokedText);
  });

  it('should mark a message without text as deleted', () => {
    expect(buildRevokedMessageText({ originalText: null, revokedAt: REVOKED_AT })).toBe(
      '(Deleted on 2026-11-20T10:00:00.000Z)',
    );
  });
});

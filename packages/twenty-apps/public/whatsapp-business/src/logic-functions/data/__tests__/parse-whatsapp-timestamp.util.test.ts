import { describe, expect, it } from 'vitest';
import { parseWhatsAppTimestamp } from 'src/logic-functions/data/parse-whatsapp-timestamp.util';

describe('parseWhatsAppTimestamp', () => {
  it('should read Unix seconds sent as a string or a number', () => {
    expect(parseWhatsAppTimestamp('1700000000').toISOString()).toBe('2023-11-14T22:13:20.000Z');
    expect(parseWhatsAppTimestamp(1700000000).toISOString()).toBe('2023-11-14T22:13:20.000Z');
  });
});

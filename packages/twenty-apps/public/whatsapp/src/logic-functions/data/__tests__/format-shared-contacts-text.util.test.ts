import { describe, expect, it } from 'vitest';
import { formatSharedContactsText } from 'src/logic-functions/data/format-shared-contacts-text.util';

describe('formatSharedContactsText', () => {
  it('should list each contact with its phones and emails', () => {
    expect(
      formatSharedContactsText([
        {
          name: { formatted_name: 'Ada Lovelace' },
          phones: [{ phone: '+1 650 555 1234' }],
          emails: [{ email: 'ada@example.com' }],
          org: {},
        },
        { name: { formatted_name: 'Alan Turing' }, org: {} },
      ]),
    ).toBe('Ada Lovelace\n+1 650 555 1234\nada@example.com\n\nAlan Turing');
  });
});

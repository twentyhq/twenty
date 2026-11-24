import { describe, expect, it } from 'vitest';

import { getWhatsappPhoneHandle } from 'src/logic-functions/utils/get-whatsapp-phone-handle.util';

describe('getWhatsappPhoneHandle', () => {
  it.each([
    ['33612345678', '+33612345678'],
    ['+33 6 12 34 56 78', '+33612345678'],
    ['33612345678@s.whatsapp.net', '+33612345678'],
  ])(
    'reads the phone number %s Unipile exposes',
    (publicIdentifier, handle) => {
      expect(
        getWhatsappPhoneHandle({
          id: '199912345678901@lid',
          public_identifier: publicIdentifier,
        }),
      ).toBe(handle);
    },
  );

  it.each(['33612345678@s.whatsapp.net', '33612345678:12@s.whatsapp.net'])(
    'falls back to the phone number of the id %s',
    (id) => {
      expect(getWhatsappPhoneHandle({ id })).toBe('+33612345678');
    },
  );

  it.each([
    [{ id: '199912345678901@lid' }],
    [{ id: '120363041234567890@g.us' }],
    [{ id: '199912345678901@lid', public_identifier: 'priya.sharma' }],
    [{ id: '199912345678901@lid', public_identifier: '1234' }],
  ])('gives no handle to %o, whose phone number is hidden', (user) => {
    expect(getWhatsappPhoneHandle(user)).toBeUndefined();
  });
});

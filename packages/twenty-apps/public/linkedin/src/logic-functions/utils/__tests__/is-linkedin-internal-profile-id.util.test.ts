import { describe, expect, it } from 'vitest';

import { isLinkedinInternalProfileId } from 'src/logic-functions/utils/is-linkedin-internal-profile-id.util';

describe('isLinkedinInternalProfileId', () => {
  it.each(['ACoAAA123', 'ACwAAB456', 'acoaaa123'])(
    'recognizes the internal profile id %s',
    (profileIdentifier) => {
      expect(isLinkedinInternalProfileId(profileIdentifier)).toBe(true);
    },
  );

  it.each(['grace-hopper', 'acme', 'ada-lovelace-123'])(
    'treats %s as a public vanity slug',
    (profileIdentifier) => {
      expect(isLinkedinInternalProfileId(profileIdentifier)).toBe(false);
    },
  );
});

import { describe, expect, it } from 'vitest';

import { isWhatsappHistoryTabHash } from 'src/front-components/utils/is-whatsapp-history-tab-hash.util';

describe('isWhatsappHistoryTabHash', () => {
  it.each(['#history', '#history/past-conversations'])(
    'recognizes the History tab in %s',
    (hash) => {
      expect(isWhatsappHistoryTabHash(hash)).toBe(true);
    },
  );

  it.each(['#3bba047b-6b10-4d21-8d9e-f23e65f08671', '#general', '', undefined])(
    'shows the Sync tab for %s',
    (hash) => {
      expect(isWhatsappHistoryTabHash(hash)).toBe(false);
    },
  );
});

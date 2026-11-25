import { describe, expect, it } from 'vitest';

import { isLinkedinHistoryTabHash } from 'src/front-components/utils/is-linkedin-history-tab-hash.util';

describe('isLinkedinHistoryTabHash', () => {
  it.each(['#history', '#history/past-conversations'])(
    'recognizes the History tab in %s',
    (hash) => {
      expect(isLinkedinHistoryTabHash(hash)).toBe(true);
    },
  );

  it.each(['#7d48ab00-8e9c-408b-b7ea-8e752c59ee7a', '#general', '', undefined])(
    'shows the Sync tab for %s',
    (hash) => {
      expect(isLinkedinHistoryTabHash(hash)).toBe(false);
    },
  );
});

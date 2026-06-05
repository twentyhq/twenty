import { describe, expect, it } from 'vitest';

import { pickWritableStandard } from 'src/logic-functions/utils/pick-writable-standard';
import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';

describe('pickWritableStandard', () => {
  it('keeps a mapped field only when the current value is empty', () => {
    const writable = pickWritableStandard(
      { name: 'Acme', jobTitle: 'CEO' },
      { name: '', jobTitle: 'Existing' },
      { name: isEmptyText, jobTitle: isEmptyText },
    );

    expect(writable).toEqual({ name: 'Acme' });
  });

  it('always keeps fields without a registered check', () => {
    const writable = pickWritableStandard(
      { extra: 'value' },
      { extra: 'already here' },
      {},
    );

    expect(writable).toEqual({ extra: 'value' });
  });
});

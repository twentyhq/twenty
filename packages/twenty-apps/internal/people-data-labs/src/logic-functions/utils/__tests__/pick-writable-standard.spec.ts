import { describe, expect, it } from 'vitest';

import { pickWritableStandard } from 'src/logic-functions/utils/pick-writable-standard';
import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';

describe('pickWritableStandard', () => {
  it('keeps a mapped field only when the current value is empty', () => {
    const writable = pickWritableStandard({
      standard: { name: 'Acme', jobTitle: 'CEO' },
      current: { name: '', jobTitle: 'Existing' },
      emptyChecks: { name: isEmptyText, jobTitle: isEmptyText },
    });

    expect(writable).toEqual({ name: 'Acme' });
  });

  it('skips fields without a registered check rather than overwriting them', () => {
    const writable = pickWritableStandard({
      standard: { extra: 'value' },
      current: { extra: 'already here' },
      emptyChecks: {},
    });

    expect(writable).toEqual({});
  });
});

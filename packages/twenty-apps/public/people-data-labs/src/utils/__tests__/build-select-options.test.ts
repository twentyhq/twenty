import { describe, expect, it } from 'vitest';

import { buildSelectOptions } from 'src/utils/build-select-options';

describe('buildSelectOptions', () => {
  it('attaches the universalIdentifier to each option by key', () => {
    const options = buildSelectOptions({
      meta: [
        { key: 'a', value: 'A', label: 'Option A', color: 'blue', position: 0 },
        { key: 'b', value: 'B', label: 'Option B', color: 'red', position: 1 },
      ],
      ids: { a: 'id-a', b: 'id-b' },
    });

    expect(options).toEqual([
      { id: 'id-a', value: 'A', label: 'Option A', color: 'blue', position: 0 },
      { id: 'id-b', value: 'B', label: 'Option B', color: 'red', position: 1 },
    ]);
  });
});

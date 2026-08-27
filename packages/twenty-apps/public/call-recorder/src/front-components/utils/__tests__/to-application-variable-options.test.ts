import { describe, expect, it } from 'vitest';

import { toApplicationVariableOptions } from 'src/front-components/utils/to-application-variable-options.util';

describe('toApplicationVariableOptions', () => {
  it('keeps options that carry a label and a value', () => {
    expect(
      toApplicationVariableOptions([
        { label: 'Recall.ai', value: 'recallai_async' },
        { label: 'Gladia', value: 'gladia_v2_async' },
      ]),
    ).toEqual([
      { label: 'Recall.ai', value: 'recallai_async' },
      { label: 'Gladia', value: 'gladia_v2_async' },
    ]);
  });

  it('drops malformed entries', () => {
    expect(
      toApplicationVariableOptions([
        { label: 'Recall.ai', value: 'recallai_async' },
        { label: 'Missing value' },
        null,
        'option',
      ]),
    ).toEqual([{ label: 'Recall.ai', value: 'recallai_async' }]);
  });

  it('returns an empty list when options are not an array', () => {
    expect(toApplicationVariableOptions(null)).toEqual([]);
    expect(toApplicationVariableOptions(undefined)).toEqual([]);
  });
});

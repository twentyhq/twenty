import { describe, expect, it } from 'vitest';

import { humanizeSelectValue } from 'src/logic-functions/utils/humanize-select-value';

describe('humanizeSelectValue', () => {
  it('should turn an API enum value into a readable label', () => {
    expect(humanizeSelectValue('IN_PROGRESS')).toBe('In progress');
  });

  it('should keep a single word capitalized', () => {
    expect(humanizeSelectValue('DONE')).toBe('Done');
  });
});

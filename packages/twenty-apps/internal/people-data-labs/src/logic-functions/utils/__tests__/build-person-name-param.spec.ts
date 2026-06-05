import { describe, expect, it } from 'vitest';

import { buildPersonNameParam } from 'src/logic-functions/utils/build-person-name-param';

describe('buildPersonNameParam', () => {
  it('joins the present name parts', () => {
    expect(buildPersonNameParam('Jane', 'Doe')).toBe('Jane Doe');
    expect(buildPersonNameParam('Jane', '')).toBe('Jane');
  });

  it('returns undefined when no name part is present', () => {
    expect(buildPersonNameParam('', null)).toBeUndefined();
  });
});

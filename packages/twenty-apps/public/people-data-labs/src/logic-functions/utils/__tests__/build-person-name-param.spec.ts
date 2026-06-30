import { describe, expect, it } from 'vitest';

import { buildPersonNameParam } from 'src/logic-functions/utils/build-person-name-param';

describe('buildPersonNameParam', () => {
  it('joins a full first and last name', () => {
    expect(buildPersonNameParam({ firstName: 'Jane', lastName: 'Doe' })).toBe(
      'Jane Doe',
    );
  });

  it('returns undefined unless both name parts are present', () => {
    expect(buildPersonNameParam({ firstName: 'Jane', lastName: '' })).toBeUndefined();
    expect(buildPersonNameParam({ firstName: '', lastName: 'Doe' })).toBeUndefined();
    expect(buildPersonNameParam({ firstName: '', lastName: null })).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';

import { RESTRICTED_FIELD_PLACEHOLDER } from 'src/logic-functions/constants/restricted-field-placeholder';
import { stripRestrictedFieldValue } from 'src/logic-functions/utils/strip-restricted-field-value.util';

describe('stripRestrictedFieldValue', () => {
  it('nullifies the calendar visibility restriction placeholder', () => {
    expect(stripRestrictedFieldValue(RESTRICTED_FIELD_PLACEHOLDER)).toBeNull();
  });

  it('keeps regular values', () => {
    expect(stripRestrictedFieldValue('Customer Discovery Call')).toBe(
      'Customer Discovery Call',
    );
  });

  it('keeps null', () => {
    expect(stripRestrictedFieldValue(null)).toBeNull();
  });
});

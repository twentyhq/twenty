import { describe, expect, it } from 'vitest';

import { RESTRICTED_FIELD_PLACEHOLDER } from 'src/logic-functions/constants/restricted-field-placeholder';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

describe('stripRestrictedFieldValue', () => {
  it('drops the calendar visibility restriction placeholder', () => {
    expect(
      stripRestrictedFieldValue(RESTRICTED_FIELD_PLACEHOLDER),
    ).toBeUndefined();
  });

  it('keeps regular values', () => {
    expect(stripRestrictedFieldValue('Customer Discovery Call')).toBe(
      'Customer Discovery Call',
    );
  });

  it('keeps undefined', () => {
    expect(stripRestrictedFieldValue(undefined)).toBeUndefined();
  });
});

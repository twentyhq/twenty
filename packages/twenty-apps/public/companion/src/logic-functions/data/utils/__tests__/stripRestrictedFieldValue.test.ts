import { describe, expect, it } from 'vitest';

import { RESTRICTED_FIELD_PLACEHOLDER } from 'src/logic-functions/constants/RESTRICTED_FIELD_PLACEHOLDER';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/utils/stripRestrictedFieldValue';

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

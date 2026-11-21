import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { describe, expect, it } from 'vitest';

import { ALL_VIEW_FIELDS } from 'src/constants/all-view-fields';

describe('ALL_VIEW_FIELDS', () => {
  it('should target the standard person, company and opportunity objects', () => {
    expect(
      ALL_VIEW_FIELDS.map(
        ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
      ),
    ).toEqual([
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    ]);
  });
});

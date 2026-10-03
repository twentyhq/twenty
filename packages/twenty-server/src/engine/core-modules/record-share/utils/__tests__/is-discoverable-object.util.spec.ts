/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';

import { isDiscoverableObject } from 'src/engine/core-modules/record-share/utils/is-discoverable-object.util';

describe('isDiscoverableObject', () => {
  it.each([
    [MetadataReadability.DISCOVERABLE, null, true],
    [MetadataReadability.INHERITED, ['field-universal-identifier'], true],
    [MetadataReadability.INHERITED, [], false],
    [MetadataReadability.INHERITED, null, false],
    [MetadataReadability.PRIVATE, ['field-universal-identifier'], false],
    [MetadataReadability.OPEN, null, false],
  ])(
    'is %s with discoverable fields %j: %s',
    (readability, discoverableFieldUniversalIdentifiers, expected) => {
      expect(
        isDiscoverableObject({
          readability,
          discoverableFieldUniversalIdentifiers,
        }),
      ).toBe(expected);
    },
  );
});

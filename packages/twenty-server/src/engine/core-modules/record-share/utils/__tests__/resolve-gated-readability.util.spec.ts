import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { resolveGatedReadability } from 'src/engine/core-modules/record-share/utils/resolve-gated-readability.util';

describe('resolveGatedReadability', () => {
  it.each([
    STANDARD_OBJECTS.messageThread.universalIdentifier,
    STANDARD_OBJECTS.message.universalIdentifier,
    STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  ])(
    'keeps email and calendar private until the upgrade opens them to discovery (%s)',
    (universalIdentifier) => {
      expect(
        resolveGatedReadability({
          universalIdentifier,
          readability: MetadataReadability.OPEN,
        }),
      ).toBe(MetadataReadability.PRIVATE);
    },
  );

  it('leaves upgraded email and calendar objects alone', () => {
    expect(
      resolveGatedReadability({
        universalIdentifier: STANDARD_OBJECTS.messageThread.universalIdentifier,
        readability: MetadataReadability.DISCOVERABLE,
      }),
    ).toBe(MetadataReadability.DISCOVERABLE);
    expect(
      resolveGatedReadability({
        universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
        readability: MetadataReadability.INHERITED,
      }),
    ).toBe(MetadataReadability.INHERITED);
  });

  it('leaves other open objects open', () => {
    expect(
      resolveGatedReadability({
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        readability: MetadataReadability.OPEN,
      }),
    ).toBe(MetadataReadability.OPEN);
  });
});

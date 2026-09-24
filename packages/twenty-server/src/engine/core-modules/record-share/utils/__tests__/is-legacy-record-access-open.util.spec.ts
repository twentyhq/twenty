import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isLegacyRecordAccessOpen } from 'src/engine/core-modules/record-share/utils/is-legacy-record-access-open.util';
import { resolveRecordShareGateKind } from 'src/engine/core-modules/record-share/utils/resolve-record-share-gate-kind.util';

it.each([
  [MetadataReadability.SYSTEM, false, false, true],
  [MetadataReadability.SYSTEM, true, false, true],
  [MetadataReadability.SYSTEM, true, true, false],
  [MetadataReadability.PRIVATE, false, false, false],
  [MetadataReadability.PRIVATE, true, false, false],
])(
  'preserves pre-upgrade policy only until metadata activation: %s/%s/%s',
  (readability, flag, entitlement, expected) => {
    const legacyOpen = isLegacyRecordAccessOpen({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
            readability,
          },
        },
      },
      wasRecordSharingEnabled: flag && entitlement,
    } as never);
    expect(legacyOpen).toBe(expected);
    expect(
      resolveRecordShareGateKind({
        readability: MetadataReadability.PRIVATE,
        isOwningApplication: false,
        isLegacyRecordAccessOpen: legacyOpen,
      }),
    ).toBe(expected ? 'open' : 'private');
    expect(
      resolveRecordShareGateKind({
        readability: MetadataReadability.SYSTEM,
        isOwningApplication: false,
        isLegacyRecordAccessOpen: legacyOpen,
      }),
    ).toBe('deny');
  },
);

/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { resolveRecordSharingMode } from 'src/engine/core-modules/record-share/utils/resolve-record-sharing-mode.util';

describe('resolveRecordSharingMode', () => {
  it.each([
    [MetadataReadability.PRIVATE, false, false, RecordSharingMode.PRIVATE],
    [MetadataReadability.PRIVATE, true, false, RecordSharingMode.PRIVATE],
    [MetadataReadability.INHERITED, false, false, RecordSharingMode.INHERITED],
    [MetadataReadability.OPEN, false, true, RecordSharingMode.OPEN_BY_DEFAULT],
    [MetadataReadability.OPEN, false, false, RecordSharingMode.NONE],
    [MetadataReadability.OPEN, true, true, RecordSharingMode.NONE],
    [MetadataReadability.SYSTEM, false, true, RecordSharingMode.NONE],
    [MetadataReadability.APPLICATION, false, true, RecordSharingMode.NONE],
  ])(
    'should resolve a %s object (system: %s) with the flag %s to %s',
    (readability, isSystem, isRecordSharingEnabled, sharingMode) => {
      expect(
        resolveRecordSharingMode({
          flatObjectMetadata: { readability, isSystem },
          isRecordSharingEnabled,
        }),
      ).toBe(sharingMode);
    },
  );
});

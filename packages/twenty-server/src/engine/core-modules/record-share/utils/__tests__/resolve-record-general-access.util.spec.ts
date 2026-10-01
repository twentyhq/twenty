/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { resolveRecordGeneralAccess } from 'src/engine/core-modules/record-share/utils/resolve-record-general-access.util';

const buildEveryoneShare = (
  accessLevel: RecordShareAccessLevel,
  rowCause = RecordShareRowCause.MANUAL,
): RecordShare => ({
  id: 'share-1',
  recordId: 'record-1',
  objectMetadataId: 'object-1',
  principalId: EVERYONE_PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.EVERYONE,
  accessLevel,
  rowCause,
  sourceId: 'record-1',
});

describe('resolveRecordGeneralAccess', () => {
  it.each([
    [MetadataReadability.OPEN, true, RecordShareAccessLevel.READ_WRITE],
    [MetadataReadability.PRIVATE, false, RecordShareAccessLevel.NONE],
    [MetadataReadability.INHERITED, false, null],
  ])(
    'should fall back to the default of a %s object',
    (readability, isRecordShareExceptionObject, accessLevel) => {
      expect(
        resolveRecordGeneralAccess({
          readability,
          isRecordShareExceptionObject,
          recordShares: [],
        }),
      ).toEqual({ accessLevel, isDefault: true });
    },
  );

  it('should read a restriction of a record open by default', () => {
    expect(
      resolveRecordGeneralAccess({
        readability: MetadataReadability.OPEN,
        isRecordShareExceptionObject: true,
        recordShares: [buildEveryoneShare(RecordShareAccessLevel.NONE)],
      }),
    ).toEqual({ accessLevel: RecordShareAccessLevel.NONE, isDefault: false });
  });

  it('should read a manual opening of a private record', () => {
    expect(
      resolveRecordGeneralAccess({
        readability: MetadataReadability.PRIVATE,
        isRecordShareExceptionObject: false,
        recordShares: [buildEveryoneShare(RecordShareAccessLevel.READ)],
      }),
    ).toEqual({ accessLevel: RecordShareAccessLevel.READ, isDefault: false });
  });

  it('should ignore everyone grants managed by a rule', () => {
    expect(
      resolveRecordGeneralAccess({
        readability: MetadataReadability.PRIVATE,
        isRecordShareExceptionObject: false,
        recordShares: [
          buildEveryoneShare(
            RecordShareAccessLevel.FULL,
            RecordShareRowCause.RULE,
          ),
        ],
      }),
    ).toEqual({ accessLevel: RecordShareAccessLevel.NONE, isDefault: true });
  });
});

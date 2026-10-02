/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { resolveRecordGeneralAccessLevel } from 'src/engine/core-modules/record-share/utils/resolve-record-general-access-level.util';

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

describe('resolveRecordGeneralAccessLevel', () => {
  it.each([
    [RecordSharingMode.OPEN_BY_DEFAULT, RecordShareAccessLevel.READ_WRITE],
    [RecordSharingMode.PRIVATE, RecordShareAccessLevel.NONE],
    [RecordSharingMode.INHERITED, RecordShareAccessLevel.NONE],
    [RecordSharingMode.NONE, null],
  ])(
    'should fall back to the default of a %s object',
    (sharingMode, accessLevel) => {
      expect(
        resolveRecordGeneralAccessLevel({ sharingMode, recordShares: [] }),
      ).toBe(accessLevel);
    },
  );

  it('should read a restriction of a record open by default', () => {
    expect(
      resolveRecordGeneralAccessLevel({
        sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
        recordShares: [buildEveryoneShare(RecordShareAccessLevel.NONE)],
      }),
    ).toBe(RecordShareAccessLevel.NONE);
  });

  it('should read a manual opening of a private record', () => {
    expect(
      resolveRecordGeneralAccessLevel({
        sharingMode: RecordSharingMode.PRIVATE,
        recordShares: [buildEveryoneShare(RecordShareAccessLevel.READ)],
      }),
    ).toBe(RecordShareAccessLevel.READ);
  });

  it('should ignore everyone grants managed by a rule', () => {
    expect(
      resolveRecordGeneralAccessLevel({
        sharingMode: RecordSharingMode.PRIVATE,
        recordShares: [
          buildEveryoneShare(
            RecordShareAccessLevel.FULL,
            RecordShareRowCause.RULE,
          ),
        ],
      }),
    ).toBe(RecordShareAccessLevel.NONE);
  });

  it('should report no general access when records are not shared', () => {
    expect(
      resolveRecordGeneralAccessLevel({
        sharingMode: RecordSharingMode.NONE,
        recordShares: [buildEveryoneShare(RecordShareAccessLevel.READ)],
      }),
    ).toBeNull();
  });
});

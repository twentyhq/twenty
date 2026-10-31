/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { resolveRecordGeneralAccessLevel } from 'src/engine/core-modules/record-share/assignment/utils/resolve-record-general-access-level.util';

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
    RecordShareAccessLevel.READ_WRITE,
    RecordShareAccessLevel.NONE,
    null,
  ])(
    'should fall back to the default general access %s',
    (defaultGeneralAccessLevel) => {
      expect(
        resolveRecordGeneralAccessLevel({
          defaultGeneralAccessLevel,
          recordShares: [],
        }),
      ).toBe(defaultGeneralAccessLevel);
    },
  );

  it('should read a restriction of a record open by default', () => {
    expect(
      resolveRecordGeneralAccessLevel({
        defaultGeneralAccessLevel: RecordShareAccessLevel.READ_WRITE,
        recordShares: [buildEveryoneShare(RecordShareAccessLevel.NONE)],
      }),
    ).toBe(RecordShareAccessLevel.NONE);
  });

  it('should read a manual opening of a private record', () => {
    expect(
      resolveRecordGeneralAccessLevel({
        defaultGeneralAccessLevel: RecordShareAccessLevel.NONE,
        recordShares: [buildEveryoneShare(RecordShareAccessLevel.READ)],
      }),
    ).toBe(RecordShareAccessLevel.READ);
  });

  it('should ignore everyone grants managed by a rule', () => {
    expect(
      resolveRecordGeneralAccessLevel({
        defaultGeneralAccessLevel: RecordShareAccessLevel.READ_WRITE,
        recordShares: [
          buildEveryoneShare(
            RecordShareAccessLevel.FULL,
            RecordShareRowCause.RULE,
          ),
        ],
      }),
    ).toBe(RecordShareAccessLevel.READ_WRITE);
  });

  it('should report no general access when records are not shared', () => {
    expect(
      resolveRecordGeneralAccessLevel({
        defaultGeneralAccessLevel: null,
        recordShares: [buildEveryoneShare(RecordShareAccessLevel.READ)],
      }),
    ).toBeNull();
  });
});

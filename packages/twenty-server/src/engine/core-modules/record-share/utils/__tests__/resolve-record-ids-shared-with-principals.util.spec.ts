/* @license Enterprise */

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/core-modules/record-share/utils/resolve-record-ids-shared-with-principals.util';

const buildRecordShare = (
  recordId: string,
  principalId: string,
  accessLevel: RecordShareAccessLevel,
): RecordShare => ({
  id: `${recordId}-${principalId}`,
  recordId,
  objectMetadataId: 'object-metadata-id',
  principalId,
  principalType: RecordSharePrincipalType.ROLE,
  accessLevel,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: 'source-id',
});

describe('resolveRecordIdsSharedWithPrincipals', () => {
  const recordShares = [
    buildRecordShare('record-1', 'role-1', RecordShareAccessLevel.READ),
    buildRecordShare('record-2', 'role-2', RecordShareAccessLevel.FULL),
    buildRecordShare('record-3', 'role-1', RecordShareAccessLevel.FULL),
  ];

  it('should keep the records a listed principal holds at a listed access level', () => {
    expect(
      resolveRecordIdsSharedWithPrincipals({
        recordShares,
        principalIds: ['role-1'],
        accessLevels: [
          RecordShareAccessLevel.READ,
          RecordShareAccessLevel.FULL,
        ],
      }),
    ).toEqual(new Set(['record-1', 'record-3']));
  });

  it('should drop the records whose share rows only grant a lower access level', () => {
    expect(
      resolveRecordIdsSharedWithPrincipals({
        recordShares,
        principalIds: ['role-1', 'role-2'],
        accessLevels: [RecordShareAccessLevel.FULL],
      }),
    ).toEqual(new Set(['record-2', 'record-3']));
  });

  it('should admit nothing to a principal without a share row', () => {
    expect(
      resolveRecordIdsSharedWithPrincipals({
        recordShares,
        principalIds: ['role-3'],
        accessLevels: [RecordShareAccessLevel.READ],
      }),
    ).toEqual(new Set());
  });
});

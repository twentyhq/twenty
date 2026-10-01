/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { resolveRecordIdsRestrictedForPrincipals } from 'src/engine/core-modules/record-share/utils/resolve-record-ids-restricted-for-principals.util';

const MEMBER_ID = 'member-1';
const SELECT_ACCESS_LEVELS = [
  RecordShareAccessLevel.READ,
  RecordShareAccessLevel.READ_WRITE,
  RecordShareAccessLevel.FULL,
];
const UPDATE_ACCESS_LEVELS = [
  RecordShareAccessLevel.READ_WRITE,
  RecordShareAccessLevel.FULL,
];

const buildShare = (
  recordId: string,
  principalId: string,
  accessLevel: RecordShareAccessLevel,
): RecordShare => ({
  id: `${recordId}-${principalId}`,
  recordId,
  objectMetadataId: 'object-1',
  principalId,
  principalType:
    principalId === EVERYONE_PRINCIPAL_ID
      ? RecordSharePrincipalType.EVERYONE
      : RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: recordId,
});

describe('resolveRecordIdsRestrictedForPrincipals', () => {
  it('should restrict a record whose everyone row is below the required level', () => {
    expect(
      resolveRecordIdsRestrictedForPrincipals({
        recordShares: [
          buildShare(
            'restricted',
            EVERYONE_PRINCIPAL_ID,
            RecordShareAccessLevel.NONE,
          ),
          buildShare(
            'view-only',
            EVERYONE_PRINCIPAL_ID,
            RecordShareAccessLevel.READ,
          ),
        ],
        principalIds: [EVERYONE_PRINCIPAL_ID, MEMBER_ID],
        accessLevels: SELECT_ACCESS_LEVELS,
      }),
    ).toEqual(new Set(['restricted']));
  });

  it('should restrict a view-only record for an update', () => {
    expect(
      resolveRecordIdsRestrictedForPrincipals({
        recordShares: [
          buildShare(
            'view-only',
            EVERYONE_PRINCIPAL_ID,
            RecordShareAccessLevel.READ,
          ),
        ],
        principalIds: [EVERYONE_PRINCIPAL_ID, MEMBER_ID],
        accessLevels: UPDATE_ACCESS_LEVELS,
      }),
    ).toEqual(new Set(['view-only']));
  });

  it('should lift a restriction for a principal holding a sufficient grant', () => {
    expect(
      resolveRecordIdsRestrictedForPrincipals({
        recordShares: [
          buildShare(
            'restricted',
            EVERYONE_PRINCIPAL_ID,
            RecordShareAccessLevel.NONE,
          ),
          buildShare('restricted', MEMBER_ID, RecordShareAccessLevel.READ),
        ],
        principalIds: [EVERYONE_PRINCIPAL_ID, MEMBER_ID],
        accessLevels: SELECT_ACCESS_LEVELS,
      }),
    ).toEqual(new Set());
  });

  it('should keep a restriction when the grant is below the required level', () => {
    expect(
      resolveRecordIdsRestrictedForPrincipals({
        recordShares: [
          buildShare(
            'restricted',
            EVERYONE_PRINCIPAL_ID,
            RecordShareAccessLevel.NONE,
          ),
          buildShare('restricted', MEMBER_ID, RecordShareAccessLevel.READ),
        ],
        principalIds: [EVERYONE_PRINCIPAL_ID, MEMBER_ID],
        accessLevels: UPDATE_ACCESS_LEVELS,
      }),
    ).toEqual(new Set(['restricted']));
  });

  it('should not let another everyone row lift a restriction', () => {
    expect(
      resolveRecordIdsRestrictedForPrincipals({
        recordShares: [
          buildShare(
            'restricted',
            EVERYONE_PRINCIPAL_ID,
            RecordShareAccessLevel.NONE,
          ),
          buildShare(
            'restricted',
            EVERYONE_PRINCIPAL_ID,
            RecordShareAccessLevel.FULL,
          ),
        ],
        principalIds: [EVERYONE_PRINCIPAL_ID, MEMBER_ID],
        accessLevels: SELECT_ACCESS_LEVELS,
      }),
    ).toEqual(new Set(['restricted']));
  });

  it('should ignore grants to other principals', () => {
    expect(
      resolveRecordIdsRestrictedForPrincipals({
        recordShares: [
          buildShare(
            'restricted',
            EVERYONE_PRINCIPAL_ID,
            RecordShareAccessLevel.NONE,
          ),
          buildShare('restricted', 'member-2', RecordShareAccessLevel.FULL),
        ],
        principalIds: [EVERYONE_PRINCIPAL_ID, MEMBER_ID],
        accessLevels: SELECT_ACCESS_LEVELS,
      }),
    ).toEqual(new Set(['restricted']));
  });
});

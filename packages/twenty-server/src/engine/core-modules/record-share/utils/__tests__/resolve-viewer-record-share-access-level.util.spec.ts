/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { resolveViewerRecordShareAccessLevel } from 'src/engine/core-modules/record-share/utils/resolve-viewer-record-share-access-level.util';

const MEMBER_ID = 'member-1';
const PRINCIPAL_IDS = [EVERYONE_PRINCIPAL_ID, MEMBER_ID];

const buildShare = (
  principalId: string,
  accessLevel: RecordShareAccessLevel,
): RecordShare => ({
  id: `${principalId}-${accessLevel}`,
  recordId: 'record-1',
  objectMetadataId: 'object-1',
  principalId,
  principalType:
    principalId === EVERYONE_PRINCIPAL_ID
      ? RecordSharePrincipalType.EVERYONE
      : RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: 'record-1',
});

describe('resolveViewerRecordShareAccessLevel', () => {
  it('should keep the highest grant held by the viewer', () => {
    expect(
      resolveViewerRecordShareAccessLevel({
        recordShares: [
          buildShare(EVERYONE_PRINCIPAL_ID, RecordShareAccessLevel.READ),
          buildShare(MEMBER_ID, RecordShareAccessLevel.READ_WRITE),
          buildShare('member-2', RecordShareAccessLevel.FULL),
        ],
        principalIds: PRINCIPAL_IDS,
        implicitAccessLevels: [],
      }),
    ).toBe(RecordShareAccessLevel.READ_WRITE);
  });

  it('should never report a restriction as an access level', () => {
    expect(
      resolveViewerRecordShareAccessLevel({
        recordShares: [
          buildShare(EVERYONE_PRINCIPAL_ID, RecordShareAccessLevel.NONE),
        ],
        principalIds: PRINCIPAL_IDS,
        implicitAccessLevels: [RecordShareAccessLevel.NONE, null],
      }),
    ).toBeNull();
  });

  it('should count implicit access such as the ownership of the creator', () => {
    expect(
      resolveViewerRecordShareAccessLevel({
        recordShares: [
          buildShare(EVERYONE_PRINCIPAL_ID, RecordShareAccessLevel.NONE),
        ],
        principalIds: PRINCIPAL_IDS,
        implicitAccessLevels: [RecordShareAccessLevel.FULL],
      }),
    ).toBe(RecordShareAccessLevel.FULL);
  });
});

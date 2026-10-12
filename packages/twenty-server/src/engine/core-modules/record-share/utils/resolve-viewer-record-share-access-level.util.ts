/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';

const RECORD_SHARE_ACCESS_LEVELS_BY_PRECEDENCE = [
  RecordShareAccessLevel.FULL,
  RecordShareAccessLevel.READ_WRITE,
  RecordShareAccessLevel.READ,
];

// The creator of a record open by default owns it without a grant, and
// everyone holds its general access until a row says otherwise
export const resolveViewerRecordShareAccessLevel = ({
  recordShares,
  principalIds,
  implicitAccessLevels,
}: {
  recordShares: RecordShare[];
  principalIds: string[];
  implicitAccessLevels: (RecordShareAccessLevel | null)[];
}): RecordShareAccessLevel | null =>
  RECORD_SHARE_ACCESS_LEVELS_BY_PRECEDENCE.find(
    (accessLevel) =>
      implicitAccessLevels.includes(accessLevel) ||
      recordShares.some(
        (recordShare) =>
          principalIds.includes(recordShare.principalId) &&
          recordShare.accessLevel === accessLevel,
      ),
  ) ?? null;

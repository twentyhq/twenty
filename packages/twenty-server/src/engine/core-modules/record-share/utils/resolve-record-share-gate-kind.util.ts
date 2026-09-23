/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export type RecordShareGateKind = 'open' | 'deny' | 'private' | 'inherited';

export const resolveRecordShareGateKind = ({
  readability,
  isOwningApplication,
  isRecordSharingEnabled,
}: {
  readability: MetadataReadability;
  isOwningApplication: boolean;
  isRecordSharingEnabled: boolean;
}): RecordShareGateKind => {
  switch (readability) {
    case MetadataReadability.OPEN:
      return 'open';
    case MetadataReadability.SYSTEM:
      return 'deny';
    case MetadataReadability.APPLICATION:
      return !isRecordSharingEnabled || isOwningApplication ? 'open' : 'deny';
    case MetadataReadability.PRIVATE:
      return !isRecordSharingEnabled || isOwningApplication
        ? 'open'
        : 'private';
    case MetadataReadability.INHERITED:
      return !isRecordSharingEnabled || isOwningApplication
        ? 'open'
        : 'inherited';
    default:
      assertUnreachable(readability);
  }
};

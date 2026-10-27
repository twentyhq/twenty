/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export type RecordShareGateKind = 'open' | 'deny' | 'private' | 'inherited';

// Only the frozen 2-43 upgrade command specs still read legacy readability gates
export const resolveRecordShareGateKind = ({
  readability,
  isOwningApplication,
}: {
  readability: MetadataReadability;
  isOwningApplication: boolean;
}): RecordShareGateKind => {
  switch (readability) {
    case MetadataReadability.OPEN:
    case MetadataReadability.APPLICATION:
      return 'open';
    case MetadataReadability.SYSTEM:
      return 'deny';
    case MetadataReadability.PRIVATE:
      return isOwningApplication ? 'open' : 'private';
    case MetadataReadability.INHERITED:
      return isOwningApplication ? 'open' : 'inherited';
    default:
      assertUnreachable(readability);
  }
};

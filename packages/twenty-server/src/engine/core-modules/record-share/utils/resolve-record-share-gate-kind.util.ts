import { MetadataReadability } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export type RecordShareGateKind = 'open' | 'deny' | 'private' | 'inherited';

export const resolveRecordShareGateKind = ({
  readability,
  isOwningApplication,
  isLegacyRecordAccessOpen = false,
}: {
  readability: MetadataReadability;
  isOwningApplication: boolean;
  isLegacyRecordAccessOpen?: boolean;
}): RecordShareGateKind => {
  switch (readability) {
    case MetadataReadability.OPEN:
      return 'open';
    case MetadataReadability.SYSTEM:
      return 'deny';
    case MetadataReadability.APPLICATION:
      return isLegacyRecordAccessOpen || isOwningApplication ? 'open' : 'deny';
    case MetadataReadability.PRIVATE:
      return isLegacyRecordAccessOpen || isOwningApplication
        ? 'open'
        : 'private';
    case MetadataReadability.INHERITED:
      return isLegacyRecordAccessOpen || isOwningApplication
        ? 'open'
        : 'inherited';
    default:
      assertUnreachable(readability);
  }
};
